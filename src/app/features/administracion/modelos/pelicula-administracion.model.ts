import { Genero } from '../../../core/modelos/pelicula.model';

export interface PeliculaAdministracion {
  id: string;
  nombre: string;
  duracionMinutos: number;
  imagenUrl: string;
  sinopsis: string;
  clasificacionEdad: number | null;
  fechaEstreno: string;
  publicada: boolean;
  preventaHabilitada: boolean;
  precioPreventa: number | null;
  generos: Genero[];
  cantidadFunciones: number;
}

export type DatosPelicula = Omit<PeliculaAdministracion, 'id' | 'generos' | 'cantidadFunciones'> & {
  generoIds: string[];
};

export interface GeneroAdministracion extends Genero {
  cantidadPeliculas: number;
}
