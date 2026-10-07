import { Relacion, unico } from '../../../core/helpers/relacion.helpers';
import { TipoRecompensa } from '../../../core/modelos/recompensa.model';
import { DatosRecompensa, RecompensaAdministracion } from '../modelos/recompensa-administracion.model';

export const COLUMNAS_RECOMPENSA_ADMINISTRACION =
  'id, tipo, producto_id, nombre, puntos_costo, activo, productos ( nombre ), canjes ( count )';

export function mapearRecompensaAdministracion(fila: {
  id: string;
  tipo: TipoRecompensa;
  producto_id: string | null;
  nombre: string;
  puntos_costo: number;
  activo: boolean;
  productos: Relacion<{ nombre: string }>;
  canjes: { count: number }[] | null;
}): RecompensaAdministracion {
  return {
    id: fila.id,
    tipo: fila.tipo,
    productoId: fila.producto_id,
    productoNombre: unico(fila.productos)?.nombre ?? null,
    nombre: fila.nombre,
    puntosCosto: fila.puntos_costo,
    activo: fila.activo,
    cantidadCanjes: fila.canjes?.[0]?.count ?? 0,
  };
}

export function filaDesdeDatosRecompensa(datos: DatosRecompensa) {
  return {
    tipo: datos.tipo,
    producto_id: datos.tipo === 'producto' ? datos.productoId : null,
    nombre: datos.nombre,
    puntos_costo: datos.puntosCosto,
    activo: datos.activo,
  };
}
