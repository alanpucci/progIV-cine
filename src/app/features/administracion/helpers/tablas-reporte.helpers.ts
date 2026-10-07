import { formatearPesos } from '../../../core/helpers/movimiento.formato';
import { CeldaTabla, FormatoColumna, Reporte, TablaReporte } from '../modelos/reporte-administracion.model';
import { formatearDiaReporte } from './periodo-reporte.helpers';

const FORMATEADOR_FUNCION_REPORTE = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

const FORMATEADOR_ENTERO = new Intl.NumberFormat('es-AR');

export function formatearInicioFuncionReporte(inicio: string): string {
  return FORMATEADOR_FUNCION_REPORTE.format(new Date(inicio));
}

export function formatearCelda(celda: CeldaTabla, formato: FormatoColumna): string {
  if (typeof celda === 'string') return celda;
  return formato === 'pesos' ? formatearPesos(celda) : FORMATEADOR_ENTERO.format(celda);
}

export function tablasDelReporte(reporte: Reporte): TablaReporte[] {
  const { totales } = reporte;
  return [
    {
      titulo: 'Facturación diaria',
      hoja: 'Facturación',
      columnas: [
        { titulo: 'Día', formato: 'texto', ancho: 18 },
        { titulo: 'Ventas', formato: 'entero', ancho: 10 },
        { titulo: 'Entradas', formato: 'entero', ancho: 10 },
        { titulo: 'Descuentos', formato: 'pesos', ancho: 14 },
        { titulo: 'Facturado', formato: 'pesos', ancho: 16 },
      ],
      filas: reporte.dias.map((dia) => [
        formatearDiaReporte(dia.fecha),
        dia.ventas,
        dia.entradas,
        dia.descuentos,
        dia.facturado,
      ]),
      total: ['Total', totales.ventas, totales.entradas, totales.descuentos, totales.facturado],
    },
    {
      titulo: 'Entradas por película',
      hoja: 'Por película',
      columnas: [
        { titulo: 'Película', formato: 'texto', ancho: 34 },
        { titulo: 'Funciones', formato: 'entero', ancho: 10 },
        { titulo: 'Entradas', formato: 'entero', ancho: 10 },
        { titulo: 'Importe de lista', formato: 'pesos', ancho: 16 },
      ],
      filas: reporte.peliculas.map((pelicula) => [
        pelicula.nombre,
        pelicula.funciones,
        pelicula.entradas,
        pelicula.importe,
      ]),
      total: null,
    },
    {
      titulo: 'Entradas por función',
      hoja: 'Por función',
      columnas: [
        { titulo: 'Película', formato: 'texto', ancho: 34 },
        { titulo: 'Función', formato: 'texto', ancho: 18 },
        { titulo: 'Sala', formato: 'texto', ancho: 14 },
        { titulo: 'Entradas', formato: 'entero', ancho: 10 },
      ],
      filas: reporte.funciones.map((funcion) => [
        funcion.pelicula,
        formatearInicioFuncionReporte(funcion.inicio),
        funcion.sala,
        funcion.entradas,
      ]),
      total: null,
    },
    {
      titulo: 'Productos vendidos',
      hoja: 'Productos',
      columnas: [
        { titulo: 'Producto', formato: 'texto', ancho: 34 },
        { titulo: 'Sueltos', formato: 'entero', ancho: 10 },
        { titulo: 'En combos', formato: 'entero', ancho: 10 },
        { titulo: 'Unidades', formato: 'entero', ancho: 10 },
      ],
      filas: reporte.productos.map((producto) => [
        producto.nombre,
        producto.sueltos,
        producto.enCombos,
        producto.unidades,
      ]),
      total: null,
    },
  ];
}
