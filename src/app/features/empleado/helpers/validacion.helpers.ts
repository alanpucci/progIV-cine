import { ConceptoValidacion, EntradaEscaneada } from '../modelos/validacion.model';

const FORMATEADOR_MOMENTO = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatearMomento(fecha: string): string {
  return FORMATEADOR_MOMENTO.format(new Date(fecha));
}

export function motivoRechazo(concepto: ConceptoValidacion, entrada: EntradaEscaneada | null): string | null {
  if (!entrada) return 'El código no corresponde a ninguna entrada.';
  if (entrada.estadoVenta === 'cancelada' || entrada.estado === 'cancelada') return 'La compra de esta entrada fue cancelada.';
  if (entrada.estadoVenta === 'pendiente') return 'La compra de esta entrada no se terminó de pagar.';

  if (concepto === 'entrada') {
    if (entrada.estado === 'validada') {
      return `La entrada ya se usó${entrada.validadaAt ? ` (${formatearMomento(entrada.validadaAt)})` : ''}.`;
    }
    return null;
  }

  if (entrada.candy.length === 0) return 'La compra no incluye productos del Candy Bar.';
  if (entrada.candyEntregadoAt) return `El Candy de esta compra ya se entregó (${formatearMomento(entrada.candyEntregadoAt)}).`;
  return null;
}
