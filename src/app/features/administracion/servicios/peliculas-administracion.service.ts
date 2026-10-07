import { Service, inject } from '@angular/core';
import { SupabaseService } from '../../../core/servicios/supabase.service';
import { DatosPelicula, PeliculaAdministracion } from '../modelos/pelicula-administracion.model';
import {
  COLUMNAS_PELICULA_ADMINISTRACION,
  filaDesdeDatosPelicula,
  mapearPeliculaAdministracion,
} from '../helpers/pelicula-administracion.mapeos';

const CODIGO_REFERENCIA_EXISTENTE = '23503';
const MENSAJE_PELICULA_CON_FUNCIONES =
  'La película tiene funciones cargadas, así que no se puede eliminar. Podés ocultarla del catálogo.';

@Service()
export class PeliculasAdministracionService {
  private readonly supabase = inject(SupabaseService).cliente;

  async obtenerListado(): Promise<PeliculaAdministracion[]> {
    const { data, error } = await this.supabase
      .from('peliculas')
      .select(COLUMNAS_PELICULA_ADMINISTRACION)
      .order('fecha_estreno', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(mapearPeliculaAdministracion);
  }

  async obtenerPorId(id: string): Promise<PeliculaAdministracion | null> {
    const { data, error } = await this.supabase
      .from('peliculas')
      .select(COLUMNAS_PELICULA_ADMINISTRACION)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data ? mapearPeliculaAdministracion(data) : null;
  }

  async crear(datos: DatosPelicula): Promise<void> {
    const { data, error } = await this.supabase
      .from('peliculas')
      .insert(filaDesdeDatosPelicula(datos))
      .select('id')
      .single();

    if (error) throw error;
    await this.reemplazarGeneros(data.id, datos.generoIds);
  }

  async actualizar(id: string, datos: DatosPelicula): Promise<void> {
    const { error } = await this.supabase.from('peliculas').update(filaDesdeDatosPelicula(datos)).eq('id', id);

    if (error) throw error;
    await this.reemplazarGeneros(id, datos.generoIds);
  }

  async cambiarPublicacion(id: string, publicada: boolean): Promise<void> {
    const { error } = await this.supabase.from('peliculas').update({ publicada }).eq('id', id);

    if (error) throw error;
  }

  async eliminar(id: string): Promise<void> {
    const { error } = await this.supabase.from('peliculas').delete().eq('id', id);

    if (error?.code === CODIGO_REFERENCIA_EXISTENTE) throw new Error(MENSAJE_PELICULA_CON_FUNCIONES);
    if (error) throw error;
  }

  private async reemplazarGeneros(peliculaId: string, generoIds: string[]): Promise<void> {
    const { error: errorBorrado } = await this.supabase.from('pelicula_genero').delete().eq('pelicula_id', peliculaId);
    if (errorBorrado) throw errorBorrado;

    const { error } = await this.supabase
      .from('pelicula_genero')
      .insert(generoIds.map((generoId) => ({ pelicula_id: peliculaId, genero_id: generoId })));
    if (error) throw error;
  }
}
