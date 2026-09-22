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
}

export interface FuncionDisponible {
  id: string;
  salaId: string;
  inicio: string;
  tipoProyeccion: string;
  idioma: string;
  precioBase: number;
}

export interface ResenaPelicula {
  id: string;
  estrellas: number;
  comentario: string | null;
  creadaEn: string;
}

export interface PeliculaDetalle extends PeliculaResumen {
  sinopsis: string;
  fechaEstreno: string;
  preventaHabilitada: boolean;
  precioPreventa: number | null;
  funciones: FuncionDisponible[];
  resenas: ResenaPelicula[];
  promedioEstrellas: number | null;
}
