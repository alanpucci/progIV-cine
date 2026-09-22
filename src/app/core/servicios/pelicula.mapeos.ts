import { FuncionDisponible, PeliculaResumen } from '../modelos/pelicula.model';

export function mapearFuncion(fila: {
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

export function mapearResumen(fila: {
  id: string;
  nombre: string;
  duracion_minutos: number;
  imagen_url: string;
  clasificacion_edad: number | null;
  entradas_vendidas: number;
  pelicula_genero: { generos: { id: string; nombre: string } | { id: string; nombre: string }[] }[] | null;
}): PeliculaResumen {
  return {
    id: fila.id,
    nombre: fila.nombre,
    duracionMinutos: fila.duracion_minutos,
    imagenUrl: fila.imagen_url,
    clasificacionEdad: fila.clasificacion_edad,
    entradasVendidas: fila.entradas_vendidas,
    generos: (fila.pelicula_genero ?? []).flatMap((pg) => pg.generos),
  };
}
