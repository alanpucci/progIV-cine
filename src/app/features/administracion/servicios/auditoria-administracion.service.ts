import { Service, inject } from '@angular/core';
import { SupabaseService } from '../../../core/servicios/supabase.service';
import {
  FiltrosAuditoria,
  PersonalAuditado,
  RegistroActividad,
} from '../modelos/auditoria-administracion.model';
import {
  COLUMNAS_LOG_ACTIVIDAD,
  FilaLogActividad,
  mapearRegistroActividad,
} from '../helpers/auditoria-administracion.mapeos';
import { limitesDelPeriodo } from '../helpers/periodo-reporte.helpers';

const LIMITE_REGISTROS = 200;

@Service()
export class AuditoriaAdministracionService {
  private readonly supabase = inject(SupabaseService).cliente;

  async obtenerRegistros(filtros: FiltrosAuditoria): Promise<RegistroActividad[]> {
    let consulta = this.supabase
      .from('logs_actividad')
      .select(COLUMNAS_LOG_ACTIVIDAD)
      .order('created_at', { ascending: false })
      .limit(LIMITE_REGISTROS);

    if (filtros.usuarioId) consulta = consulta.eq('usuario_id', filtros.usuarioId);
    if (filtros.entidad) consulta = consulta.eq('entidad', filtros.entidad);
    if (filtros.accion) consulta = consulta.eq('accion', filtros.accion);
    if (filtros.desde) {
      consulta = consulta.gte('created_at', limitesDelPeriodo({ desde: filtros.desde, hasta: filtros.desde }).desde);
    }
    if (filtros.hasta) {
      consulta = consulta.lt('created_at', limitesDelPeriodo({ desde: filtros.hasta, hasta: filtros.hasta }).hastaExclusivo);
    }

    const { data, error } = await consulta;
    if (error) throw error;
    return (data as FilaLogActividad[]).map(mapearRegistroActividad);
  }

  async obtenerPersonal(): Promise<PersonalAuditado[]> {
    const { data, error } = await this.supabase
      .from('perfiles')
      .select('id, nombre, apellido')
      .in('rol', ['admin', 'empleado'])
      .order('apellido');

    if (error) throw error;
    return data.map((perfil) => ({ id: perfil.id, nombre: `${perfil.nombre} ${perfil.apellido}` }));
  }
}
