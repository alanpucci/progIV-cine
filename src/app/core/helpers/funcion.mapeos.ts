import { FuncionDisponible, Idioma, TipoProyeccion } from '../modelos/funcion.model';

export function mapearFuncionDisponible(fila: {
  id: string;
  sala_id: string;
  inicio: string;
  tipo_proyeccion: TipoProyeccion;
  idioma: Idioma;
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
