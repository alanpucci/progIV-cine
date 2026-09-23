import { Butaca, FuncionDisponible, FuncionMapa, Idioma, TipoButaca, TipoProyeccion } from '../modelos/funcion.model';

export function mapearFuncionDisponible(fila: {
  id: string;
  sala_id: string;
  salas: { nombre: string } | { nombre: string }[] | null;
  inicio: string;
  tipo_proyeccion: TipoProyeccion;
  idioma: Idioma;
  precio_base: number;
}): FuncionDisponible {
  const sala = Array.isArray(fila.salas) ? fila.salas[0] : fila.salas;
  return {
    id: fila.id,
    salaId: fila.sala_id,
    salaNombre: sala?.nombre ?? '',
    inicio: fila.inicio,
    tipoProyeccion: fila.tipo_proyeccion,
    idioma: fila.idioma,
    precioBase: fila.precio_base,
  };
}

export function mapearFuncionMapa(fila: {
  id: string;
  pelicula_id: string;
  sala_id: string;
  peliculas: { nombre: string } | { nombre: string }[] | null;
  salas: { nombre: string } | { nombre: string }[] | null;
  inicio: string;
  tipo_proyeccion: TipoProyeccion;
  idioma: Idioma;
  precio_base: number;
}): FuncionMapa {
  const pelicula = Array.isArray(fila.peliculas) ? fila.peliculas[0] : fila.peliculas;
  const sala = Array.isArray(fila.salas) ? fila.salas[0] : fila.salas;
  return {
    id: fila.id,
    peliculaId: fila.pelicula_id,
    peliculaNombre: pelicula?.nombre ?? '',
    salaId: fila.sala_id,
    salaNombre: sala?.nombre ?? '',
    inicio: fila.inicio,
    tipoProyeccion: fila.tipo_proyeccion,
    idioma: fila.idioma,
    precioBase: fila.precio_base,
  };
}

export function mapearButaca(registro: {
  id: string;
  sala_id: string;
  fila: string;
  numero: number;
  tipo: TipoButaca;
  precio_adicional: number;
  activa: boolean;
}): Butaca {
  return {
    id: registro.id,
    salaId: registro.sala_id,
    fila: registro.fila,
    numero: registro.numero,
    tipo: registro.tipo,
    precioAdicional: registro.precio_adicional,
    activa: registro.activa,
  };
}
