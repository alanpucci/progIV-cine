export type TipoMovimientoPuntos = 'acreditacion' | 'debito' | 'ajuste';
export type TipoMovimientoCredito = 'acreditacion' | 'uso' | 'ajuste';

export interface Movimiento<TTipo extends string> {
  id: string;
  tipo: TTipo;
  cantidad: number;
  fecha: string;
  ventaId: string | null;
}

export interface MovimientoPuntos extends Movimiento<TipoMovimientoPuntos> {
  canje: string | null;
}
export type MovimientoCredito = Movimiento<TipoMovimientoCredito>;

export interface SaldosCuenta {
  puntos: number;
  credito: number;
}
