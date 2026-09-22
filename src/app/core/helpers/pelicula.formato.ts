export function formatearDuracion(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const minutosRestantes = minutos % 60;
  return horas > 0 ? `${horas}h ${minutosRestantes}m` : `${minutosRestantes}m`;
}

export function formatearClasificacion(clasificacionEdad: number | null): string {
  return clasificacionEdad === null ? 'ATP' : `+${clasificacionEdad}`;
}
