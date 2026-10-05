import { EstadoEntrada } from '../../../core/modelos/entrada.model';
import { Idioma, TipoButaca, TipoProyeccion } from '../../../core/modelos/funcion.model';
import { Relacion, unico } from '../../../core/helpers/relacion.helpers';
import { FuncionConEntradas } from '../modelos/entrada-usuario.model';

interface FilaFuncionEntrada {
  id: string;
  inicio: string;
  fin: string;
  tipo_proyeccion: TipoProyeccion;
  idioma: Idioma;
  salas: Relacion<{ nombre: string }>;
  peliculas: Relacion<{ nombre: string; clasificacion_edad: number | null }>;
}

export interface FilaEntradaUsuario {
  id: string;
  codigo_qr: string;
  estado: EstadoEntrada;
  venta_items: Relacion<{
    butacas: Relacion<{ fila: string; numero: number; tipo: TipoButaca }>;
    funciones: Relacion<FilaFuncionEntrada>;
  }>;
}

export const COLUMNAS_ENTRADA_USUARIO = `
  id,
  codigo_qr,
  estado,
  venta_items!inner (
    butacas ( fila, numero, tipo ),
    funciones ( id, inicio, fin, tipo_proyeccion, idioma, salas ( nombre ), peliculas ( nombre, clasificacion_edad ) ),
    ventas!inner ( usuario_id, estado )
  )
`;

export function agruparPorFuncion(filas: FilaEntradaUsuario[]): FuncionConEntradas[] {
  const porFuncion = new Map<string, FuncionConEntradas>();

  for (const fila of filas) {
    const item = unico(fila.venta_items);
    const butaca = item ? unico(item.butacas) : null;
    const funcion = item ? unico(item.funciones) : null;
    if (!butaca || !funcion) continue;

    let grupo = porFuncion.get(funcion.id);
    if (!grupo) {
      const pelicula = unico(funcion.peliculas);
      grupo = {
        id: funcion.id,
        fin: funcion.fin,
        funcion: {
          peliculaNombre: pelicula?.nombre ?? 'Película no disponible',
          clasificacionEdad: pelicula?.clasificacion_edad ?? null,
          salaNombre: unico(funcion.salas)?.nombre ?? '',
          inicio: funcion.inicio,
          tipoProyeccion: funcion.tipo_proyeccion,
          idioma: funcion.idioma,
        },
        entradas: [],
      };
      porFuncion.set(funcion.id, grupo);
    }

    grupo.entradas.push({
      id: fila.id,
      codigoQr: fila.codigo_qr,
      estado: fila.estado,
      fila: butaca.fila,
      numero: butaca.numero,
      tipo: butaca.tipo,
    });
  }

  const grupos = [...porFuncion.values()];
  for (const grupo of grupos) {
    grupo.entradas.sort((a, b) => a.fila.localeCompare(b.fila) || a.numero - b.numero);
  }
  return grupos;
}
