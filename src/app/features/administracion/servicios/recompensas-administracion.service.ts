import { Service, inject } from '@angular/core';
import { SupabaseService } from '../../../core/servicios/supabase.service';
import { DatosRecompensa, RecompensaAdministracion } from '../modelos/recompensa-administracion.model';
import {
  COLUMNAS_RECOMPENSA_ADMINISTRACION,
  filaDesdeDatosRecompensa,
  mapearRecompensaAdministracion,
} from '../helpers/recompensa-administracion.mapeos';

const CODIGO_REFERENCIA_EXISTENTE = '23503';
const MENSAJE_RECOMPENSA_CANJEADA =
  'La recompensa ya se canjeó en alguna compra, así que no se puede eliminar. Podés desactivarla.';

@Service()
export class RecompensasAdministracionService {
  private readonly supabase = inject(SupabaseService).cliente;

  async obtenerListado(): Promise<RecompensaAdministracion[]> {
    const { data, error } = await this.supabase
      .from('recompensas')
      .select(COLUMNAS_RECOMPENSA_ADMINISTRACION)
      .order('puntos_costo');

    if (error) throw error;
    return (data ?? []).map(mapearRecompensaAdministracion);
  }

  async obtenerPorId(id: string): Promise<RecompensaAdministracion | null> {
    const { data, error } = await this.supabase
      .from('recompensas')
      .select(COLUMNAS_RECOMPENSA_ADMINISTRACION)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data ? mapearRecompensaAdministracion(data) : null;
  }

  async crear(datos: DatosRecompensa): Promise<void> {
    const { error } = await this.supabase.from('recompensas').insert(filaDesdeDatosRecompensa(datos));

    if (error) throw error;
  }

  async actualizar(id: string, datos: DatosRecompensa): Promise<void> {
    const { error } = await this.supabase.from('recompensas').update(filaDesdeDatosRecompensa(datos)).eq('id', id);

    if (error) throw error;
  }

  async cambiarActivacion(id: string, activo: boolean): Promise<void> {
    const { error } = await this.supabase.from('recompensas').update({ activo }).eq('id', id);

    if (error) throw error;
  }

  async eliminar(id: string): Promise<void> {
    const { error } = await this.supabase.from('recompensas').delete().eq('id', id);

    if (error?.code === CODIGO_REFERENCIA_EXISTENTE) throw new Error(MENSAJE_RECOMPENSA_CANJEADA);
    if (error) throw error;
  }
}
