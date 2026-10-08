import { formatearFechaMovimiento } from '../../../core/helpers/movimiento.formato';
import { Relacion, unico } from '../../../core/helpers/relacion.helpers';
import {
  AccionAuditada,
  CambioActividad,
  EntidadAuditada,
  RegistroActividad,
} from '../modelos/auditoria-administracion.model';

export interface FilaLogActividad {
  id: string;
  accion: AccionAuditada;
  entidad: EntidadAuditada;
  entidad_id: string | null;
  detalle: {
    referencia?: string;
    resultado?: 'validado' | 'rechazado';
    cambios?: Record<string, unknown>;
  } | null;
  created_at: string;
  perfiles: Relacion<{ nombre: string; apellido: string }>;
}

export const COLUMNAS_LOG_ACTIVIDAD = `
  id,
  accion,
  entidad,
  entidad_id,
  detalle,
  created_at,
  perfiles ( nombre, apellido )
`;

export const ETIQUETAS_ENTIDAD: Record<EntidadAuditada, string> = {
  peliculas: 'Película',
  generos: 'Género',
  salas: 'Sala',
  funciones: 'Función',
  categorias_producto: 'Categoría de producto',
  productos: 'Producto',
  combos: 'Combo',
  cupones: 'Cupón',
  recompensas: 'Recompensa',
  ventas: 'Venta',
  usos_qr: 'Control de acceso',
};

export const ETIQUETAS_ACCION: Record<AccionAuditada, string> = {
  alta: 'Alta',
  modificacion: 'Modificación',
  baja: 'Baja',
  cancelacion: 'Cancelación',
  validacion_entrada: 'Validación de entrada',
  entrega_candy: 'Entrega de Candy',
};

const LARGO_MAXIMO_VALOR = 60;
const FORMATO_FECHA_ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

export function mapearRegistroActividad(fila: FilaLogActividad): RegistroActividad {
  const perfil = unico(fila.perfiles);
  return {
    id: fila.id,
    fecha: fila.created_at,
    usuario: perfil ? `${perfil.nombre} ${perfil.apellido}` : null,
    accion: fila.accion,
    entidad: fila.entidad,
    entidadId: fila.entidad_id,
    referencia: fila.detalle?.referencia ?? null,
    resultado: fila.detalle?.resultado ?? null,
    cambios: Object.entries(fila.detalle?.cambios ?? {}).map(([campo, valor]) => aCambio(campo, valor)),
  };
}

function aCambio(campo: string, valor: unknown): CambioActividad {
  return { campo: campo.replaceAll('_', ' '), valor: formatearValor(valor) };
}

function formatearValor(valor: unknown): string {
  if (valor === null || valor === undefined || valor === '') return '—';
  if (typeof valor === 'boolean') return valor ? 'Sí' : 'No';
  if (typeof valor === 'string' && FORMATO_FECHA_ISO.test(valor)) return formatearFechaMovimiento(valor);
  const texto = typeof valor === 'string' ? valor : JSON.stringify(valor);
  return texto.length > LARGO_MAXIMO_VALOR ? `${texto.slice(0, LARGO_MAXIMO_VALOR)}…` : texto;
}
