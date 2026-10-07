import { Service, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Service()
export class ResenasService {
  private readonly supabase = inject(SupabaseService).cliente;

  async guardar(usuarioId: string, peliculaId: string, estrellas: number, comentario: string | null): Promise<void> {
    const { error } = await this.supabase
      .from('resenas')
      .upsert(
        { usuario_id: usuarioId, pelicula_id: peliculaId, estrellas, comentario },
        { onConflict: 'pelicula_id,usuario_id' },
      );
    if (error) throw error;
  }
}
