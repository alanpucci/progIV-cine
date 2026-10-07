export const HORAS_LIMITE_CANCELACION = 2;

const LIMITE_CANCELACION_MS = HORAS_LIMITE_CANCELACION * 60 * 60 * 1000;

export function dentroDelPlazoDeCancelacion(inicioFuncion: string): boolean {
  return new Date(inicioFuncion).getTime() - Date.now() > LIMITE_CANCELACION_MS;
}

export function creditoPorCancelacion(total: number, puntosUsados: number): number {
  return Math.max(total - puntosUsados, 0);
}
