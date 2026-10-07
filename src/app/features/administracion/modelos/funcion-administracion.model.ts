import { EstadoFuncion, Idioma, TipoProyeccion } from '../../../core/modelos/funcion.model';

export interface FuncionAdministracion {
  id: string;
  peliculaId: string;
  peliculaNombre: string;
  salaId: string;
  salaNombre: string;
  inicio: string;
  fin: string;
  tipoProyeccion: TipoProyeccion;
  idioma: Idioma;
  precioBase: number;
  estado: EstadoFuncion;
  entradasVendidas: number;
}

export interface DatosFuncion {
  peliculaId: string;
  salaId: string;
  inicio: string;
  fin: string;
  tipoProyeccion: TipoProyeccion;
  idioma: Idioma;
  precioBase: number;
}

export interface OpcionPelicula {
  id: string;
  nombre: string;
  duracionMinutos: number;
}

export interface OpcionSala {
  id: string;
  nombre: string;
}
