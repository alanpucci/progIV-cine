export type EntidadAuditada =
  | 'peliculas'
  | 'generos'
  | 'salas'
  | 'funciones'
  | 'categorias_producto'
  | 'productos'
  | 'combos'
  | 'cupones'
  | 'recompensas'
  | 'ventas'
  | 'usos_qr';

export type AccionAuditada =
  | 'alta'
  | 'modificacion'
  | 'baja'
  | 'cancelacion'
  | 'validacion_entrada'
  | 'entrega_candy';

export interface CambioActividad {
  campo: string;
  valor: string;
}

export interface RegistroActividad {
  id: string;
  fecha: string;
  usuario: string | null;
  accion: AccionAuditada;
  entidad: EntidadAuditada;
  entidadId: string | null;
  referencia: string | null;
  resultado: 'validado' | 'rechazado' | null;
  cambios: CambioActividad[];
}

export interface FiltrosAuditoria {
  usuarioId: string;
  entidad: EntidadAuditada | '';
  accion: AccionAuditada | '';
  desde: string;
  hasta: string;
}

export interface PersonalAuditado {
  id: string;
  nombre: string;
}
