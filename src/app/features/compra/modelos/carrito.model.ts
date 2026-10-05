export type TipoExtraCarrito = 'producto' | 'combo';

export interface ExtraCarrito {
  id: string;
  tipo: TipoExtraCarrito;
  nombre: string;
  precioUnitario: number;
  cantidad: number;
}

export interface ExtrasCarrito {
  productos: ExtraCarrito[];
  combos: ExtraCarrito[];
}

export const VALOR_PUNTO_EN_PESOS = 1;

export interface SaldosAplicados {
  credito: number;
  puntos: number;
}
