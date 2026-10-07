export type EstadoVenta = 'pendiente' | 'pagada' | 'cancelada';

export interface FuncionCompra {
  peliculaId: string;
  peliculaNombre: string;
  salaNombre: string;
  inicio: string;
}

export interface ExtraCompra {
  nombre: string;
  cantidad: number;
}

export interface Compra {
  id: string;
  fecha: string;
  estado: EstadoVenta;
  total: number;
  puntosUsados: number;
  funcion: FuncionCompra | null;
  butacas: string[];
  extras: ExtraCompra[];
}

export interface PeliculaVista {
  id: string;
  nombre: string;
  imagenUrl: string;
  ultimaFuncion: string;
  estrellas: number | null;
}
