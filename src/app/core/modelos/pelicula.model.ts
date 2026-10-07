import { FuncionDisponible } from './funcion.model';

export interface Genero {
  id: string;
  nombre: string;
}

export interface PeliculaResumen {
  id: string;
  nombre: string;
  duracionMinutos: number;
  imagenUrl: string;
  clasificacionEdad: number | null;
  generos: Genero[];
  entradasVendidas: number;
  fechaEstreno: string;
  preventaHabilitada: boolean;
  precioPreventa: number | null;
}

export interface ResenaPelicula {
  id: string;
  estrellas: number;
  comentario: string | null;
  creadaEn: string;
}

export interface PeliculaDetalle extends PeliculaResumen {
  sinopsis: string;
  funciones: FuncionDisponible[];
  resenas: ResenaPelicula[];
  promedioEstrellas: number | null;
}
