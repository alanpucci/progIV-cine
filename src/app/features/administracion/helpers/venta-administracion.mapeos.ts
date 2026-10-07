import { COLUMNAS_COMPRA, FilaCompra, mapearCompra } from '../../../core/helpers/compra.mapeos';
import { Relacion, unico } from '../../../core/helpers/relacion.helpers';
import { VentaAdministracion } from '../modelos/venta-administracion.model';

export interface FilaVentaAdministracion extends FilaCompra {
  email_contacto: string;
  motivo_cancelacion: string | null;
  cancelled_at: string | null;
  perfiles: Relacion<{ nombre: string; apellido: string }>;
}

export const COLUMNAS_VENTA_ADMINISTRACION = `
  ${COLUMNAS_COMPRA},
  email_contacto,
  motivo_cancelacion,
  cancelled_at,
  perfiles ( nombre, apellido )
`;

export function mapearVentaAdministracion(fila: FilaVentaAdministracion): VentaAdministracion {
  const perfil = unico(fila.perfiles);
  return {
    ...mapearCompra(fila),
    email: fila.email_contacto,
    cliente: perfil ? `${perfil.nombre} ${perfil.apellido}` : null,
    motivoCancelacion: fila.motivo_cancelacion,
    fechaCancelacion: fila.cancelled_at,
  };
}
