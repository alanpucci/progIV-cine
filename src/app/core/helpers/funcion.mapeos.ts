import { FuncionDisponible, Idioma, TipoProyeccion } from '../modelos/funcion.model';

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
