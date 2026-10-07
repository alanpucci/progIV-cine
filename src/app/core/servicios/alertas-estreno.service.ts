import { Service, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AlertaEstreno } from '../modelos/alerta.model';
import { COLUMNAS_ALERTA, FilaAlerta, mapearAlerta } from '../helpers/alerta.mapeos';

@Service()
export class AlertasEstrenoService {
  private readonly supabase = inject(SupabaseService).cliente;

  async obtenerActivas(usuarioId: string): Promise<AlertaEstreno[]> {
    const { data, error } = await this.supabase
      .from('alertas_estreno')
      .select(COLUMNAS_ALERTA)
      .eq('usuario_id', usuarioId)
      .eq('activa', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data as FilaAlerta[])
      .map(mapearAlerta)
      .filter((alerta): alerta is AlertaEstreno => alerta !== null)
      .sort((alertaA, alertaB) => alertaA.fechaEstreno.localeCompare(alertaB.fechaEstreno));
  }

  async obtenerIdsPeliculasConAlerta(usuarioId: string): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('alertas_estreno')
      .select('pelicula_id')
      .eq('usuario_id', usuarioId)
      .eq('activa', true);

    if (error) throw error;
    return (data ?? []).map((fila) => fila.pelicula_id as string);
  }

  async activar(usuarioId: string, peliculaId: string): Promise<void> {
    const { error } = await this.supabase
      .from('alertas_estreno')
      .upsert({ usuario_id: usuarioId, pelicula_id: peliculaId, activa: true }, { onConflict: 'usuario_id,pelicula_id' });
    if (error) throw error;
  }

  async desactivar(usuarioId: string, peliculaId: string): Promise<void> {
    const { error } = await this.supabase
      .from('alertas_estreno')
      .delete()
      .eq('usuario_id', usuarioId)
      .eq('pelicula_id', peliculaId);
    if (error) throw error;
  }

  async marcarCumplidas(ids: string[]): Promise<void> {
    const { error } = await this.supabase.from('alertas_estreno').update({ activa: false }).in('id', ids);
    if (error) throw error;
  }
}
