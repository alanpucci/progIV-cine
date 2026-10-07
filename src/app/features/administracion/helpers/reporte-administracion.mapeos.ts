import { Relacion, unico } from '../../../core/helpers/relacion.helpers';
import {
  EntradasFuncion,
  EntradasPelicula,
  FacturacionDia,
  PeriodoReporte,
  ProductoVendido,
  Reporte,
} from '../modelos/reporte-administracion.model';
import { diasDelPeriodo, fechaLocal } from './periodo-reporte.helpers';

interface FilaProductoReporte {
  id: string;
  nombre: string;
}

interface FilaItemReporte {
  tipo_item: string;
  cantidad: number;
  total_linea: number | string;
  funciones: Relacion<{
    id: string;
    inicio: string;
    peliculas: Relacion<{ id: string; nombre: string }>;
    salas: Relacion<{ nombre: string }>;
  }>;
  productos: Relacion<FilaProductoReporte>;
  combos: Relacion<{ combo_items: { cantidad: number; productos: Relacion<FilaProductoReporte> }[] | null }>;
}

export interface FilaVentaReporte {
  total: number | string;
  descuento: number | string;
  created_at: string;
  venta_items: FilaItemReporte[] | null;
}

export const COLUMNAS_VENTA_REPORTE = `
  total,
  descuento,
  created_at,
  venta_items (
    tipo_item,
    cantidad,
    total_linea,
    funciones ( id, inicio, peliculas ( id, nombre ), salas ( nombre ) ),
    productos ( id, nombre ),
    combos ( combo_items ( cantidad, productos ( id, nombre ) ) )
  )
`;

function redondear(monto: number): number {
  return Math.round(monto * 100) / 100;
}

export function armarReporte(filas: FilaVentaReporte[], periodo: PeriodoReporte): Reporte {
  const dias = new Map<string, FacturacionDia>(
    diasDelPeriodo(periodo).map((fecha) => [fecha, { fecha, ventas: 0, entradas: 0, descuentos: 0, facturado: 0 }]),
  );
  const peliculas = new Map<string, EntradasPelicula>();
  const funcionesPorPelicula = new Map<string, Set<string>>();
  const funciones = new Map<string, EntradasFuncion>();
  const productos = new Map<string, ProductoVendido>();

  const sumarProducto = (producto: FilaProductoReporte | null, sueltos: number, enCombos: number) => {
    if (!producto) return;
    const actual = productos.get(producto.id) ?? {
      productoId: producto.id,
      nombre: producto.nombre,
      sueltos: 0,
      enCombos: 0,
      unidades: 0,
    };
    actual.sueltos += sueltos;
    actual.enCombos += enCombos;
    actual.unidades += sueltos + enCombos;
    productos.set(producto.id, actual);
  };

  for (const fila of filas) {
    const dia = dias.get(fechaLocal(new Date(fila.created_at)));
    if (!dia) continue;
    dia.ventas += 1;
    dia.facturado += Number(fila.total);
    dia.descuentos += Number(fila.descuento);

    for (const item of fila.venta_items ?? []) {
      if (item.tipo_item === 'entrada') {
        const funcion = unico(item.funciones);
        const pelicula = funcion ? unico(funcion.peliculas) : null;
        dia.entradas += item.cantidad;
        if (!funcion || !pelicula) continue;

        const resumen = peliculas.get(pelicula.id) ?? {
          peliculaId: pelicula.id,
          nombre: pelicula.nombre,
          funciones: 0,
          entradas: 0,
          importe: 0,
        };
        resumen.entradas += item.cantidad;
        resumen.importe += Number(item.total_linea);
        peliculas.set(pelicula.id, resumen);
        funcionesPorPelicula.set(pelicula.id, (funcionesPorPelicula.get(pelicula.id) ?? new Set()).add(funcion.id));

        const porFuncion = funciones.get(funcion.id) ?? {
          funcionId: funcion.id,
          pelicula: pelicula.nombre,
          sala: unico(funcion.salas)?.nombre ?? '',
          inicio: funcion.inicio,
          entradas: 0,
        };
        porFuncion.entradas += item.cantidad;
        funciones.set(funcion.id, porFuncion);
      } else if (item.tipo_item === 'producto') {
        sumarProducto(unico(item.productos), item.cantidad, 0);
      } else if (item.tipo_item === 'combo') {
        for (const componente of unico(item.combos)?.combo_items ?? []) {
          sumarProducto(unico(componente.productos), 0, componente.cantidad * item.cantidad);
        }
      }
    }
  }

  const listaDias = [...dias.values()].map((dia) => ({
    ...dia,
    descuentos: redondear(dia.descuentos),
    facturado: redondear(dia.facturado),
  }));

  return {
    periodo,
    totales: {
      ventas: listaDias.reduce((suma, dia) => suma + dia.ventas, 0),
      entradas: listaDias.reduce((suma, dia) => suma + dia.entradas, 0),
      descuentos: redondear(listaDias.reduce((suma, dia) => suma + dia.descuentos, 0)),
      facturado: redondear(listaDias.reduce((suma, dia) => suma + dia.facturado, 0)),
    },
    dias: listaDias,
    peliculas: [...peliculas.values()]
      .map((pelicula) => ({
        ...pelicula,
        funciones: funcionesPorPelicula.get(pelicula.peliculaId)?.size ?? 0,
        importe: redondear(pelicula.importe),
      }))
      .sort((a, b) => b.entradas - a.entradas || a.nombre.localeCompare(b.nombre)),
    funciones: [...funciones.values()].sort((a, b) => a.inicio.localeCompare(b.inicio)),
    productos: [...productos.values()].sort((a, b) => b.unidades - a.unidades || a.nombre.localeCompare(b.nombre)),
  };
}
