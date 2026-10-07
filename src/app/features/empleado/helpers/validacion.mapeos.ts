import { EstadoVenta } from '../../../core/modelos/compra.model';
import { EstadoEntrada } from '../../../core/modelos/entrada.model';
import { Idioma, TipoButaca, TipoProyeccion } from '../../../core/modelos/funcion.model';
import { Relacion, unico } from '../../../core/helpers/relacion.helpers';
import { ConceptoValidacion, EntradaEscaneada, ItemCandy, ResultadoValidacion, UsoQr } from '../modelos/validacion.model';

interface FilaItemCandy {
  tipo_item: 'entrada' | 'producto' | 'combo' | 'recompensa';
  cantidad: number;
  productos: Relacion<{ nombre: string }>;
  combos: Relacion<{ nombre: string }>;
}

export interface FilaEntradaEscaneada {
  id: string;
  codigo_qr: string;
  estado: EstadoEntrada;
  validada_at: string | null;
  adulto_requerido: boolean;
  venta_items: Relacion<{
    butacas: Relacion<{ fila: string; numero: number; tipo: TipoButaca }>;
    funciones: Relacion<{
      inicio: string;
      tipo_proyeccion: TipoProyeccion;
      idioma: Idioma;
      salas: Relacion<{ nombre: string }>;
      peliculas: Relacion<{ nombre: string; clasificacion_edad: number | null }>;
    }>;
    ventas: Relacion<{
      id: string;
      estado: EstadoVenta;
      candy_entregado_at: string | null;
      venta_items: FilaItemCandy[];
    }>;
  }>;
}

export const COLUMNAS_ENTRADA_ESCANEADA = `
  id,
  codigo_qr,
  estado,
  validada_at,
  adulto_requerido,
  venta_items!inner (
    butacas ( fila, numero, tipo ),
    funciones ( inicio, tipo_proyeccion, idioma, salas ( nombre ), peliculas ( nombre, clasificacion_edad ) ),
    ventas!inner (
      id,
      estado,
      candy_entregado_at,
      venta_items ( tipo_item, cantidad, productos ( nombre ), combos ( nombre ) )
    )
  )
`;

export interface FilaUsoQr {
  id: string;
  codigo_qr: string;
  tipo: ConceptoValidacion;
  resultado: ResultadoValidacion;
  created_at: string;
  entradas: Relacion<{
    venta_items: Relacion<{
      butacas: Relacion<{ fila: string; numero: number }>;
      funciones: Relacion<{ peliculas: Relacion<{ nombre: string }> }>;
    }>;
  }>;
}

export const COLUMNAS_USO_QR = `
  id,
  codigo_qr,
  tipo,
  resultado,
  created_at,
  entradas (
    venta_items (
      butacas ( fila, numero ),
      funciones ( peliculas ( nombre ) )
    )
  )
`;

export function normalizarCodigo(codigo: string): string {
  return codigo.replace(/\s+/g, '').toUpperCase();
}

export function aEntradaEscaneada(fila: FilaEntradaEscaneada): EntradaEscaneada | null {
  const item = unico(fila.venta_items);
  const butaca = item ? unico(item.butacas) : null;
  const funcion = item ? unico(item.funciones) : null;
  const venta = item ? unico(item.ventas) : null;
  if (!butaca || !funcion || !venta) return null;

  const pelicula = unico(funcion.peliculas);
  return {
    id: fila.id,
    ventaId: venta.id,
    codigoQr: fila.codigo_qr,
    estado: fila.estado,
    validadaAt: fila.validada_at,
    adultoRequerido: fila.adulto_requerido,
    estadoVenta: venta.estado,
    candyEntregadoAt: venta.candy_entregado_at,
    fila: butaca.fila,
    numero: butaca.numero,
    tipo: butaca.tipo,
    funcion: {
      peliculaNombre: pelicula?.nombre ?? 'Película no disponible',
      clasificacionEdad: pelicula?.clasificacion_edad ?? null,
      salaNombre: unico(funcion.salas)?.nombre ?? '',
      inicio: funcion.inicio,
      tipoProyeccion: funcion.tipo_proyeccion,
      idioma: funcion.idioma,
    },
    candy: itemsCandy(venta.venta_items),
  };
}

function itemsCandy(items: FilaItemCandy[]): ItemCandy[] {
  return items
    .filter((item) => item.tipo_item !== 'entrada')
    .map((item) => ({
      nombre: unico(item.combos)?.nombre ?? unico(item.productos)?.nombre ?? 'Producto',
      cantidad: item.cantidad,
    }));
}

export function aUsoQr(fila: FilaUsoQr): UsoQr {
  const item = unico(unico(fila.entradas)?.venta_items ?? null);
  const butaca = item ? unico(item.butacas) : null;
  const funcion = item ? unico(item.funciones) : null;
  return {
    id: fila.id,
    codigoQr: fila.codigo_qr,
    concepto: fila.tipo,
    resultado: fila.resultado,
    creadoAt: fila.created_at,
    peliculaNombre: funcion ? (unico(funcion.peliculas)?.nombre ?? null) : null,
    butaca: butaca ? `${butaca.fila}${butaca.numero}` : null,
  };
}
