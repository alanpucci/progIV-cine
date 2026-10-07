import { Service, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AlertasEstrenoService } from './alertas-estreno.service';
import { Notificacion } from '../modelos/alerta.model';
import {
  COLUMNAS_NOTIFICACION,
  FilaNotificacion,
  filaAvisoDeVenta,
  mapearNotificacion,
} from '../helpers/alerta.mapeos';
import { estadoVenta } from '../helpers/preventa.helpers';

const LIMITE_NOTIFICACIONES = 20;

@Service()
export class NotificacionesService {
  private readonly supabase = inject(SupabaseService).cliente;
  private readonly alertas = inject(AlertasEstrenoService);

  async generarAvisosDeVenta(usuarioId: string): Promise<void> {
    const cumplidas = (await this.alertas.obtenerActivas(usuarioId)).filter(
      (alerta) => estadoVenta(alerta) !== 'proximamente',
    );
    if (cumplidas.length === 0) return;

    const { error } = await this.supabase
      .from('notificaciones')
      .insert(cumplidas.map((alerta) => filaAvisoDeVenta(usuarioId, alerta)));
    if (error) throw error;

    await this.alertas.marcarCumplidas(cumplidas.map((alerta) => alerta.id));
  }

  async obtenerRecientes(usuarioId: string): Promise<Notificacion[]> {
    const { data, error } = await this.supabase
      .from('notificaciones')
      .select(COLUMNAS_NOTIFICACION)
      .eq('usuario_id', usuarioId)
      .order('created_at', { ascending: false })
      .limit(LIMITE_NOTIFICACIONES);

    if (error) throw error;
    return (data as FilaNotificacion[]).map(mapearNotificacion);
  }

  async marcarLeidas(ids: string[]): Promise<void> {
    const { error } = await this.supabase.from('notificaciones').update({ leida: true }).in('id', ids);
    if (error) throw error;
  }
}
