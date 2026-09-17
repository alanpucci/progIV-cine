import { Injectable, inject } from '@angular/core';
import { SupabaseService } from '../supabase.service';
import {
  FuncionDisponible,
  PeliculaDestacada,
  PeliculaDetalle,
  PeliculaResumen,
  ResenaPelicula,
} from '../modelos/pelicula.model';

const COLUMNAS_RESUMEN = `
  id,
  nombre,
  duracion_minutos,
  imagen_url,
  clasificacion_edad,
  pelicula_genero ( generos ( id, nombre ) )
`;

@Injectable({ providedIn: 'root' })
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

  async obtenerDestacadas(cantidad = 3): Promise<PeliculaDestacada[]> {
    const { data: ranking, error } = await this.supabase.rpc('obtener_peliculas_mas_vendidas', {
      cantidad,
    });
    if (error) throw error;

    if (ranking && ranking.length > 0) {
      const ids = ranking.map((fila: { pelicula_id: string }) => fila.pelicula_id);
      const peliculas = await this.obtenerPorIds(ids);
      const porId = new Map(peliculas.map((p) => [p.id, p]));
      return ranking
        .filter((fila: { pelicula_id: string }) => porId.has(fila.pelicula_id))
        .map((fila: { pelicula_id: string; entradas_vendidas: number }) => ({
          pelicula: porId.get(fila.pelicula_id)!,
          entradasVendidas: fila.entradas_vendidas,
        }));
    }

    // Todavía no hay ventas registradas (normal antes de la Fase 4): se
    // destacan los estrenos más recientes en su lugar.
    const recientes = await this.obtenerListado();
    return recientes.slice(0, cantidad).map((pelicula) => ({ pelicula, entradasVendidas: 0 }));
  }

  private async obtenerPorIds(ids: string[]): Promise<PeliculaResumen[]> {
    const { data, error } = await this.supabase
      .from('peliculas')
      .select(COLUMNAS_RESUMEN)
      .eq('publicada', true)
      .in('id', ids);

    if (error) throw error;
    return (data ?? []).map(mapearResumen);
  }
}

function mapearFuncion(fila: {
  id: string;
  sala_id: string;
  inicio: string;
  tipo_proyeccion: string;
  idioma: string;
  precio_base: number;
}): FuncionDisponible {
  return {
    id: fila.id,
    salaId: fila.sala_id,
    inicio: fila.inicio,
    tipoProyeccion: fila.tipo_proyeccion,
    idioma: fila.idioma,
    precioBase: fila.precio_base,
  };
}

function mapearResumen(fila: {
  id: string;
  nombre: string;
  duracion_minutos: number;
  imagen_url: string;
  clasificacion_edad: number | null;
  pelicula_genero: { generos: { id: string; nombre: string } | { id: string; nombre: string }[] }[] | null;
}): PeliculaResumen {
  return {
    id: fila.id,
    nombre: fila.nombre,
    duracionMinutos: fila.duracion_minutos,
    imagenUrl: fila.imagen_url,
    clasificacionEdad: fila.clasificacion_edad,
    generos: (fila.pelicula_genero ?? []).flatMap((pg) => pg.generos),
  };
}
