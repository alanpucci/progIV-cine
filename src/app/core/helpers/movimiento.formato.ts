import { TipoMovimientoCredito, TipoMovimientoPuntos } from '../modelos/movimiento.model';

const FORMATEADOR_PESOS = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
});

const FORMATEADOR_PUNTOS = new Intl.NumberFormat('es-AR');

const FORMATEADOR_FECHA_MOVIMIENTO = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export const ETIQUETAS_MOVIMIENTO_PUNTOS: Record<TipoMovimientoPuntos, string> = {
  acreditacion: 'Acreditación por compra',
  debito: 'Pago con puntos',
  ajuste: 'Ajuste por cancelación',
};

export const ETIQUETAS_MOVIMIENTO_CREDITO: Record<TipoMovimientoCredito, string> = {
  acreditacion: 'Crédito por cancelación',
  uso: 'Uso en compra',
  ajuste: 'Ajuste',
};

export function formatearPesos(monto: number): string {
  return FORMATEADOR_PESOS.format(monto);
}

export function formatearPuntos(puntos: number): string {
  return FORMATEADOR_PUNTOS.format(puntos);
}

export function formatearFechaMovimiento(fecha: string): string {
  return FORMATEADOR_FECHA_MOVIMIENTO.format(new Date(fecha));
}
