export function formatearDuracion(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const minutosRestantes = minutos % 60;
  return horas > 0 ? `${horas}h ${minutosRestantes}m` : `${minutosRestantes}m`;
}

export function formatearClasificacion(clasificacionEdad: number | null): string {
  return clasificacionEdad === null ? 'ATP' : `+${clasificacionEdad}`;
}

const FORMATEADOR_FECHA_FUNCION = new Intl.DateTimeFormat('es-AR', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
});

const FORMATEADOR_HORA_FUNCION = new Intl.DateTimeFormat('es-AR', {
  hour: '2-digit',
  minute: '2-digit',
});

const FORMATEADOR_FECHA_ESTRENO = new Intl.DateTimeFormat('es-AR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

export function formatearFechaFuncion(inicio: string): string {
  return FORMATEADOR_FECHA_FUNCION.format(new Date(inicio));
}

export function formatearHoraFuncion(inicio: string): string {
  return FORMATEADOR_HORA_FUNCION.format(new Date(inicio));
}

export function formatearFechaEstreno(fecha: string): string {
  return FORMATEADOR_FECHA_ESTRENO.format(new Date(fecha));
}
