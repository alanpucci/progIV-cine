import { PeliculaResumen } from '../modelos/pelicula.model';

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
