import { EstadoFuncion, Idioma, TipoProyeccion } from '../../../core/modelos/funcion.model';
import { Relacion, unico } from '../../../core/helpers/relacion.helpers';
import { DatosFuncion, FuncionAdministracion } from '../modelos/funcion-administracion.model';

export const MARGEN_ENTRE_FUNCIONES_MINUTOS = 30;

export const COLUMNAS_FUNCION_ADMINISTRACION = `
  id,
  pelicula_id,
  sala_id,
  inicio,
  fin,
  tipo_proyeccion,
  idioma,
  precio_base,
  estado,
  peliculas ( nombre ),
  salas ( nombre ),
  venta_items ( count )
`;

export function mapearFuncionAdministracion(fila: {
  id: string;
  pelicula_id: string;
  sala_id: string;
  inicio: string;
  fin: string;
  tipo_proyeccion: TipoProyeccion;
  idioma: Idioma;
  precio_base: number;
  estado: EstadoFuncion;
  peliculas: Relacion<{ nombre: string }>;
  salas: Relacion<{ nombre: string }>;
  venta_items: { count: number }[] | null;
}): FuncionAdministracion {
  return {
    id: fila.id,
    peliculaId: fila.pelicula_id,
    peliculaNombre: unico(fila.peliculas)?.nombre ?? '',
    salaId: fila.sala_id,
    salaNombre: unico(fila.salas)?.nombre ?? '',
    inicio: fila.inicio,
    fin: fila.fin,
    tipoProyeccion: fila.tipo_proyeccion,
    idioma: fila.idioma,
    precioBase: Number(fila.precio_base),
    estado: fila.estado,
    entradasVendidas: fila.venta_items?.[0]?.count ?? 0,
  };
}

export function filaDesdeDatosFuncion(datos: DatosFuncion, salaId: string) {
  return {
    pelicula_id: datos.peliculaId,
    sala_id: salaId,
    inicio: datos.inicio,
    fin: datos.fin,
    tipo_proyeccion: datos.tipoProyeccion,
    idioma: datos.idioma,
    precio_base: datos.precioBase,
  };
}

export function sumarMinutos(fechaIso: string, minutos: number): string {
  return new Date(new Date(fechaIso).getTime() + minutos * 60_000).toISOString();
}

export function fechaHoraLocal(fechaIso: string): string {
  const fecha = new Date(fechaIso);
  const dosDigitos = (valor: number) => String(valor).padStart(2, '0');
  return (
    `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(fecha.getDate())}` +
    `T${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}`
  );
}
