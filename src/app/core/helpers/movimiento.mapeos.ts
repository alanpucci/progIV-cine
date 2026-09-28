import { MovimientoCredito, MovimientoPuntos, SaldosCuenta } from '../modelos/movimiento.model';

export interface FilaMovimientoPuntos {
  id: string;
  tipo: string;
  puntos: number;
  venta_id: string | null;
  created_at: string;
}

export interface FilaMovimientoCredito {
  id: string;
  tipo: string;
  monto: number | string;
  venta_id: string | null;
  created_at: string;
}

export interface FilaSaldos {
  puntos_saldo: number;
  credito_saldo: number | string;
}

export const COLUMNAS_MOVIMIENTO_PUNTOS = 'id, tipo, puntos, venta_id, created_at';
export const COLUMNAS_MOVIMIENTO_CREDITO = 'id, tipo, monto, venta_id, created_at';
export const COLUMNAS_SALDOS = 'puntos_saldo, credito_saldo';

export function mapearMovimientoPuntos(fila: FilaMovimientoPuntos): MovimientoPuntos {
  return {
    id: fila.id,
    tipo: fila.tipo as MovimientoPuntos['tipo'],
    cantidad: fila.puntos,
    fecha: fila.created_at,
    ventaId: fila.venta_id,
  };
}

export function mapearMovimientoCredito(fila: FilaMovimientoCredito): MovimientoCredito {
  return {
    id: fila.id,
    tipo: fila.tipo as MovimientoCredito['tipo'],
    cantidad: Number(fila.monto),
    fecha: fila.created_at,
    ventaId: fila.venta_id,
  };
}

export function mapearSaldos(fila: FilaSaldos): SaldosCuenta {
  return {
    puntos: fila.puntos_saldo,
    credito: Number(fila.credito_saldo),
  };
}
