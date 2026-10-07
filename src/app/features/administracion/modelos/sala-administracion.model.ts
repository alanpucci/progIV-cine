import { TipoButaca } from '../../../core/modelos/funcion.model';

export type EstadoCelda = TipoButaca | 'pasillo';

export interface SalaAdministracion {
  id: string;
  nombre: string;
  activa: boolean;
  cantidadButacas: number;
  cantidadVip: number;
  cantidadAccesibles: number;
  cantidadFunciones: number;
}

export interface ButacaDeseada {
  fila: string;
  numero: number;
  tipo: TipoButaca;
  precioAdicional: number;
}

export interface DatosSala {
  nombre: string;
  activa: boolean;
  butacas: ButacaDeseada[];
}

export interface CambioButacas {
  fila: string;
  numeros: number[];
  valores: { tipo?: TipoButaca; activa: boolean; precio_adicional?: number };
}
