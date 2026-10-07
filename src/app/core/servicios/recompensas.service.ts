import { Service, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Recompensa } from '../modelos/recompensa.model';
import { COLUMNAS_RECOMPENSA, mapearRecompensa, recompensaDisponible } from '../helpers/recompensa.mapeos';

@Service()
export class RecompensasService {
  private readonly supabase = inject(SupabaseService).cliente;

  async obtenerDisponibles(): Promise<Recompensa[]> {
    const { data, error } = await this.supabase
      .from('recompensas')
      .select(COLUMNAS_RECOMPENSA)
      .eq('activo', true)
      .order('puntos_costo');

    if (error) throw error;
    return data.filter(recompensaDisponible).map(mapearRecompensa);
  }
}
