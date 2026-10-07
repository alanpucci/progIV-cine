export type AtajoPeriodo = 'hoy' | 'semana' | 'mes';

export interface PeriodoReporte {
  desde: string;
  hasta: string;
}

export interface FacturacionDia {
  fecha: string;
  ventas: number;
  entradas: number;
  descuentos: number;
  facturado: number;
}

export interface EntradasPelicula {
  peliculaId: string;
  nombre: string;
  funciones: number;
  entradas: number;
  importe: number;
}

export interface EntradasFuncion {
  funcionId: string;
  pelicula: string;
  sala: string;
  inicio: string;
  entradas: number;
}

export interface ProductoVendido {
  productoId: string;
  nombre: string;
  sueltos: number;
  enCombos: number;
  unidades: number;
}

export interface TotalesReporte {
  ventas: number;
  entradas: number;
  descuentos: number;
  facturado: number;
}

export interface Reporte {
  periodo: PeriodoReporte;
  totales: TotalesReporte;
  dias: FacturacionDia[];
  peliculas: EntradasPelicula[];
  funciones: EntradasFuncion[];
  productos: ProductoVendido[];
}

export type FormatoColumna = 'texto' | 'entero' | 'pesos';

export type CeldaTabla = string | number;

export interface ColumnaTabla {
  titulo: string;
  formato: FormatoColumna;
  ancho: number;
}

export interface TablaReporte {
  titulo: string;
  hoja: string;
  columnas: ColumnaTabla[];
  filas: CeldaTabla[][];
  total: CeldaTabla[] | null;
}

export interface BarraGrafico {
  etiqueta: string;
  valor: number;
  detalle: string;
}
