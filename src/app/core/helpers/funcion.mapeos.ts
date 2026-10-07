import { Butaca, FuncionDisponible, FuncionMapa, Idioma, TipoButaca, TipoProyeccion } from '../modelos/funcion.model';
import { estadoVenta, precioEntrada } from './preventa.helpers';

interface PeliculaFuncionMapa {
  nombre: string;
  clasificacion_edad: number | null;
  fecha_estreno: string;
  preventa_habilitada: boolean;
  precio_preventa: number | null;
}

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
  peliculas: PeliculaFuncionMapa | PeliculaFuncionMapa[] | null;
  salas: { nombre: string } | { nombre: string }[] | null;
  inicio: string;
  tipo_proyeccion: TipoProyeccion;
  idioma: Idioma;
  precio_base: number;
}): FuncionMapa {
  const pelicula = Array.isArray(fila.peliculas) ? fila.peliculas[0] : fila.peliculas;
  const sala = Array.isArray(fila.salas) ? fila.salas[0] : fila.salas;
  const datosVenta = {
    fechaEstreno: pelicula?.fecha_estreno ?? '',
    preventaHabilitada: pelicula?.preventa_habilitada ?? false,
    precioPreventa: pelicula?.precio_preventa ?? null,
  };
  return {
    id: fila.id,
    peliculaId: fila.pelicula_id,
    peliculaNombre: pelicula?.nombre ?? '',
    clasificacionEdad: pelicula?.clasificacion_edad ?? null,
    salaId: fila.sala_id,
    salaNombre: sala?.nombre ?? '',
    inicio: fila.inicio,
    tipoProyeccion: fila.tipo_proyeccion,
    idioma: fila.idioma,
    precioBase: precioEntrada(fila.precio_base, datosVenta),
    enPreventa: estadoVenta(datosVenta) === 'preventa',
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
