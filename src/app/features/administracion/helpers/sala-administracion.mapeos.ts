import { Butaca, TipoButaca } from '../../../core/modelos/funcion.model';
import { ButacaDeseada, CambioButacas, SalaAdministracion } from '../modelos/sala-administracion.model';

export const COLUMNAS_SALA_ADMINISTRACION = 'id, nombre, activa, butacas ( tipo, activa ), funciones ( count )';

export function mapearSalaAdministracion(fila: {
  id: string;
  nombre: string;
  activa: boolean;
  butacas: { tipo: TipoButaca; activa: boolean }[] | null;
  funciones: { count: number }[] | null;
}): SalaAdministracion {
  const activas = (fila.butacas ?? []).filter((butaca) => butaca.activa);
  return {
    id: fila.id,
    nombre: fila.nombre,
    activa: fila.activa,
    cantidadButacas: activas.length,
    cantidadVip: activas.filter((butaca) => butaca.tipo === 'vip').length,
    cantidadAccesibles: activas.filter((butaca) => butaca.tipo === 'accesible').length,
    cantidadFunciones: fila.funciones?.[0]?.count ?? 0,
  };
}

export function claveButaca(fila: string, numero: number): string {
  return `${fila}-${numero}`;
}

export function planificarCambiosButacas(
  actuales: Butaca[],
  deseadas: ButacaDeseada[],
): { altas: ButacaDeseada[]; cambios: CambioButacas[] } {
  const actualesPorClave = new Map(actuales.map((butaca) => [claveButaca(butaca.fila, butaca.numero), butaca]));
  const clavesDeseadas = new Set(deseadas.map((butaca) => claveButaca(butaca.fila, butaca.numero)));
  const altas: ButacaDeseada[] = [];
  const grupos = new Map<string, CambioButacas>();

  const agregarCambio = (fila: string, numero: number, valores: CambioButacas['valores']) => {
    const clave = `${fila}|${JSON.stringify(valores)}`;
    const grupo = grupos.get(clave) ?? { fila, numeros: [], valores };
    grupo.numeros.push(numero);
    grupos.set(clave, grupo);
  };

  for (const deseada of deseadas) {
    const actual = actualesPorClave.get(claveButaca(deseada.fila, deseada.numero));
    if (!actual) {
      altas.push(deseada);
    } else if (
      !actual.activa ||
      actual.tipo !== deseada.tipo ||
      Number(actual.precioAdicional) !== deseada.precioAdicional
    ) {
      agregarCambio(deseada.fila, deseada.numero, {
        tipo: deseada.tipo,
        activa: true,
        precio_adicional: deseada.precioAdicional,
      });
    }
  }

  for (const actual of actuales) {
    if (actual.activa && !clavesDeseadas.has(claveButaca(actual.fila, actual.numero))) {
      agregarCambio(actual.fila, actual.numero, { activa: false });
    }
  }

  return { altas, cambios: [...grupos.values()] };
}
