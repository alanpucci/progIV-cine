import { Service, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { PeliculaDetalle, PeliculaResumen, ResenaPelicula } from '../modelos/pelicula.model';
import { mapearFuncion, mapearResumen } from '../helpers/pelicula.mapeos';

const COLUMNAS_RESUMEN = `
  id,
  nombre,
  duracion_minutos,
  imagen_url,
  clasificacion_edad,
  entradas_vendidas,
  pelicula_genero ( generos ( id, nombre ) )
`;

@Service()
export class PeliculasService {
  private readonly supabase = inject(SupabaseService).cliente;

  async obtenerListado(): Promise<PeliculaResumen[]> {
    const { data, error } = await this.supabase
      .from('peliculas')
      .select(COLUMNAS_RESUMEN)
      .eq('publicada', true)
      .order('fecha_estreno', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(mapearResumen);
  }

  async obtenerDetalle(id: string): Promise<PeliculaDetalle | null> {
    const [{ data: pelicula, error: errorPelicula }, { data: funciones, error: errorFunciones }] =
      await Promise.all([
        this.supabase
          .from('peliculas')
          .select(`
            ${COLUMNAS_RESUMEN},
            sinopsis,
            fecha_estreno,
            preventa_habilitada,
            precio_preventa,
            resenas ( id, estrellas, comentario, created_at )
          `)
          .eq('id', id)
          .eq('publicada', true)
          .maybeSingle(),
        this.supabase
          .from('funciones')
          .select('id, sala_id, inicio, tipo_proyeccion, idioma, precio_base')
          .eq('pelicula_id', id)
          .eq('estado', 'programada')
          .gt('inicio', new Date().toISOString())
          .order('inicio', { ascending: true }),
      ]);

    if (errorPelicula) throw errorPelicula;
    if (!pelicula) return null;
    if (errorFunciones) throw errorFunciones;

    const resenas: ResenaPelicula[] = (pelicula.resenas ?? []).map(
      (r: { id: string; estrellas: number; comentario: string | null; created_at: string }) => ({
        id: r.id,
        estrellas: r.estrellas,
        comentario: r.comentario,
        creadaEn: r.created_at,
      }),
    );
    const promedioEstrellas =
      resenas.length === 0
        ? null
        : resenas.reduce((suma, r) => suma + r.estrellas, 0) / resenas.length;

    return {
      ...mapearResumen(pelicula),
      sinopsis: pelicula.sinopsis,
      fechaEstreno: pelicula.fecha_estreno,
      preventaHabilitada: pelicula.preventa_habilitada,
      precioPreventa: pelicula.precio_preventa,
      funciones: (funciones ?? []).map(mapearFuncion),
      resenas,
      promedioEstrellas,
    };
  }

  async obtenerDestacadas(cantidad = 3): Promise<PeliculaResumen[]> {
    const { data, error } = await this.supabase
      .from('peliculas')
      .select(COLUMNAS_RESUMEN)
      .eq('publicada', true)
      .order('entradas_vendidas', { ascending: false })
      .order('fecha_estreno', { ascending: false })
      .limit(cantidad);

    if (error) throw error;
    return (data ?? []).map(mapearResumen);
  }
}
