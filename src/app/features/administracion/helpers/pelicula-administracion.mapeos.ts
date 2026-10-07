import { Genero } from '../../../core/modelos/pelicula.model';
import { Relacion } from '../../../core/helpers/relacion.helpers';
import { DatosPelicula, GeneroAdministracion, PeliculaAdministracion } from '../modelos/pelicula-administracion.model';

export const COLUMNAS_PELICULA_ADMINISTRACION = `
  id,
  nombre,
  duracion_minutos,
  imagen_url,
  sinopsis,
  clasificacion_edad,
  fecha_estreno,
  publicada,
  preventa_habilitada,
  precio_preventa,
  pelicula_genero ( generos ( id, nombre ) ),
  funciones ( count )
`;

export const COLUMNAS_GENERO_ADMINISTRACION = 'id, nombre, pelicula_genero ( count )';

export function mapearPeliculaAdministracion(fila: {
  id: string;
  nombre: string;
  duracion_minutos: number;
  imagen_url: string;
  sinopsis: string;
  clasificacion_edad: number | null;
  fecha_estreno: string;
  publicada: boolean;
  preventa_habilitada: boolean;
  precio_preventa: number | null;
  pelicula_genero: { generos: Relacion<Genero> }[] | null;
  funciones: { count: number }[] | null;
}): PeliculaAdministracion {
  return {
    id: fila.id,
    nombre: fila.nombre,
    duracionMinutos: fila.duracion_minutos,
    imagenUrl: fila.imagen_url,
    sinopsis: fila.sinopsis,
    clasificacionEdad: fila.clasificacion_edad,
    fechaEstreno: fila.fecha_estreno,
    publicada: fila.publicada,
    preventaHabilitada: fila.preventa_habilitada,
    precioPreventa: fila.precio_preventa,
    generos: (fila.pelicula_genero ?? [])
      .flatMap((pg) => pg.generos ?? [])
      .sort((a, b) => a.nombre.localeCompare(b.nombre)),
    cantidadFunciones: fila.funciones?.[0]?.count ?? 0,
  };
}

export function filaDesdeDatosPelicula(datos: DatosPelicula) {
  return {
    nombre: datos.nombre,
    duracion_minutos: datos.duracionMinutos,
    imagen_url: datos.imagenUrl,
    sinopsis: datos.sinopsis,
    clasificacion_edad: datos.clasificacionEdad,
    fecha_estreno: datos.fechaEstreno,
    publicada: datos.publicada,
    preventa_habilitada: datos.preventaHabilitada,
    precio_preventa: datos.precioPreventa,
  };
}

export function mapearGeneroAdministracion(fila: {
  id: string;
  nombre: string;
  pelicula_genero: { count: number }[] | null;
}): GeneroAdministracion {
  return {
    id: fila.id,
    nombre: fila.nombre,
    cantidadPeliculas: fila.pelicula_genero?.[0]?.count ?? 0,
  };
}
