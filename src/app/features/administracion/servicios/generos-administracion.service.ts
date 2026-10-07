import { Service, inject } from '@angular/core';
import { SupabaseService } from '../../../core/servicios/supabase.service';
import { GeneroAdministracion } from '../modelos/pelicula-administracion.model';
import { COLUMNAS_GENERO_ADMINISTRACION, mapearGeneroAdministracion } from '../helpers/pelicula-administracion.mapeos';

const CODIGO_REGISTRO_DUPLICADO = '23505';
const MENSAJE_GENERO_DUPLICADO = 'Ya existe un género con ese nombre.';

@Service()
export class GenerosAdministracionService {
  private readonly supabase = inject(SupabaseService).cliente;

  async obtenerListado(): Promise<GeneroAdministracion[]> {
    const { data, error } = await this.supabase
      .from('generos')
      .select(COLUMNAS_GENERO_ADMINISTRACION)
      .order('nombre');

    if (error) throw error;
    return (data ?? []).map(mapearGeneroAdministracion);
  }

  async crear(nombre: string): Promise<void> {
    const { error } = await this.supabase.from('generos').insert({ nombre });

    if (error?.code === CODIGO_REGISTRO_DUPLICADO) throw new Error(MENSAJE_GENERO_DUPLICADO);
    if (error) throw error;
  }

  async renombrar(id: string, nombre: string): Promise<void> {
    const { error } = await this.supabase.from('generos').update({ nombre }).eq('id', id);

    if (error?.code === CODIGO_REGISTRO_DUPLICADO) throw new Error(MENSAJE_GENERO_DUPLICADO);
    if (error) throw error;
  }

  async eliminar(id: string): Promise<void> {
    const { error } = await this.supabase.from('generos').delete().eq('id', id);

    if (error) throw error;
  }
}
