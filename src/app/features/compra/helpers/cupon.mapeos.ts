import { CuponAplicado, TipoCupon } from '../modelos/cupon.model';

export const COLUMNAS_CUPON = 'id, codigo, porcentaje, tipo, edad_minima, fecha_inicio, fecha_fin';

export function mapearCuponAplicado(fila: {
  id: string;
  codigo: string;
  porcentaje: number;
  tipo: string;
  edad_minima: number | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
}): CuponAplicado {
  return {
    id: fila.id,
    codigo: fila.codigo,
    porcentaje: Number(fila.porcentaje),
    tipo: fila.tipo as TipoCupon,
    edadMinima: fila.edad_minima,
    fechaInicio: fila.fecha_inicio,
    fechaFin: fila.fecha_fin,
  };
}

export function estaVigente(cupon: CuponAplicado): boolean {
  const ahora = new Date();
  const empezo = !cupon.fechaInicio || ahora >= new Date(cupon.fechaInicio);
  const termino = !!cupon.fechaFin && ahora > new Date(cupon.fechaFin);
  return empezo && !termino;
}
