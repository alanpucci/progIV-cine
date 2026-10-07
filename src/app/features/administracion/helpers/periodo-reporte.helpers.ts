import { AtajoPeriodo, PeriodoReporte } from '../modelos/reporte-administracion.model';

const FORMATEADOR_DIA_REPORTE = new Intl.DateTimeFormat('es-AR', {
  weekday: 'short',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export function fechaLocal(fecha: Date): string {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

export function periodoDesdeAtajo(atajo: AtajoPeriodo, hoy = new Date()): PeriodoReporte {
  const hasta = fechaLocal(hoy);
  if (atajo === 'hoy') return { desde: hasta, hasta };
  if (atajo === 'semana') {
    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
    return { desde: fechaLocal(lunes), hasta };
  }
  return { desde: fechaLocal(new Date(hoy.getFullYear(), hoy.getMonth(), 1)), hasta };
}

export function limitesDelPeriodo(periodo: PeriodoReporte): { desde: string; hastaExclusivo: string } {
  const hasta = new Date(`${periodo.hasta}T00:00:00`);
  hasta.setDate(hasta.getDate() + 1);
  return {
    desde: new Date(`${periodo.desde}T00:00:00`).toISOString(),
    hastaExclusivo: hasta.toISOString(),
  };
}

export function diasDelPeriodo(periodo: PeriodoReporte): string[] {
  const dias: string[] = [];
  const actual = new Date(`${periodo.desde}T00:00:00`);
  const fin = new Date(`${periodo.hasta}T00:00:00`);
  while (actual <= fin) {
    dias.push(fechaLocal(actual));
    actual.setDate(actual.getDate() + 1);
  }
  return dias;
}

export function formatearDiaReporte(fecha: string): string {
  return FORMATEADOR_DIA_REPORTE.format(new Date(`${fecha}T00:00:00`));
}

export function formatearPeriodo(periodo: PeriodoReporte): string {
  if (periodo.desde === periodo.hasta) return formatearDiaReporte(periodo.desde);
  return `${formatearDiaReporte(periodo.desde)} al ${formatearDiaReporte(periodo.hasta)}`;
}
