import { Service, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Butaca, FuncionDisponible, FuncionMapa } from '../modelos/funcion.model';
import { mapearButaca, mapearFuncionDisponible, mapearFuncionMapa } from '../helpers/funcion.mapeos';

@Service()
export class FuncionesService {
  private readonly supabase = inject(SupabaseService).cliente;

  async obtenerDisponiblesPorPelicula(peliculaId: string): Promise<FuncionDisponible[]> {
    const { data, error } = await this.supabase
      .from('funciones')
      .select('id, sala_id, salas ( nombre ), inicio, tipo_proyeccion, idioma, precio_base')
      .eq('pelicula_id', peliculaId)
      .eq('estado', 'programada')
      .gt('inicio', new Date().toISOString())
      .order('inicio', { ascending: true });

    if (error) throw error;
    return (data ?? []).map(mapearFuncionDisponible);
  }

  async obtenerParaMapa(funcionId: string): Promise<FuncionMapa | null> {
    const { data, error } = await this.supabase
      .from('funciones')
      .select(
        'id, pelicula_id, sala_id, peliculas ( nombre ), salas ( nombre ), inicio, tipo_proyeccion, idioma, precio_base',
      )
      .eq('id', funcionId)
      .maybeSingle();

    if (error) throw error;
    return data ? mapearFuncionMapa(data) : null;
  }

  async obtenerButacasPorSala(salaId: string): Promise<Butaca[]> {
    const { data, error } = await this.supabase
      .from('butacas')
      .select('id, sala_id, fila, numero, tipo, precio_adicional, activa')
      .eq('sala_id', salaId)
      .eq('activa', true)
      .order('fila', { ascending: true })
      .order('numero', { ascending: true });

    if (error) throw error;
    return (data ?? []).map(mapearButaca);
  }
}
