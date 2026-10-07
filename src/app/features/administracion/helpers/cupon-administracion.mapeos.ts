import { CuponAdministracion, DatosCupon, TipoCupon } from '../modelos/cupon-administracion.model';

export const COLUMNAS_CUPON_ADMINISTRACION =
  'id, codigo, porcentaje, tipo, edad_minima, activo, fecha_inicio, fecha_fin, ventas ( count )';

export function mapearCuponAdministracion(fila: {
  id: string;
  codigo: string;
  porcentaje: number;
  tipo: TipoCupon;
  edad_minima: number | null;
  activo: boolean;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  ventas: { count: number }[] | null;
}): CuponAdministracion {
  return {
    id: fila.id,
    codigo: fila.codigo,
    porcentaje: Number(fila.porcentaje),
    tipo: fila.tipo,
    edadMinima: fila.edad_minima,
    activo: fila.activo,
    fechaInicio: fila.fecha_inicio,
    fechaFin: fila.fecha_fin,
    cantidadUsos: fila.ventas?.[0]?.count ?? 0,
  };
}

export function filaDesdeDatosCupon(datos: DatosCupon) {
  return {
    codigo: datos.codigo,
    porcentaje: datos.porcentaje,
    tipo: datos.tipo,
    edad_minima: datos.tipo === 'edad' ? datos.edadMinima : null,
    activo: datos.activo,
    fecha_inicio: datos.fechaInicio,
    fecha_fin: datos.fechaFin,
  };
}
