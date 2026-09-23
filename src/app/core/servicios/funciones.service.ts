import { Service, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { FuncionDisponible } from '../modelos/funcion.model';
import { mapearFuncionDisponible } from '../helpers/funcion.mapeos';

@Service()
export class FuncionesService {
  private readonly supabase = inject(SupabaseService).cliente;

  async obtenerDisponiblesPorPelicula(peliculaId: string): Promise<FuncionDisponible[]> {
    const { data, error } = await this.supabase
      .from('funciones')
      .select('id, sala_id, inicio, tipo_proyeccion, idioma, precio_base')
      .eq('pelicula_id', peliculaId)
      .eq('estado', 'programada')
      .gt('inicio', new Date().toISOString())
      .order('inicio', { ascending: true });

    if (error) throw error;
    return (data ?? []).map(mapearFuncionDisponible);
  }
}
