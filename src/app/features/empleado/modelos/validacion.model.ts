import { EstadoVenta } from '../../../core/modelos/compra.model';
import { EntradaImprimible, EstadoEntrada, FuncionEntrada } from '../../../core/modelos/entrada.model';

export type ConceptoValidacion = 'entrada' | 'candy';
export type ResultadoValidacion = 'validado' | 'rechazado';

export interface ItemCandy {
  nombre: string;
  cantidad: number;
}

export interface EntradaEscaneada extends EntradaImprimible {
  id: string;
  ventaId: string;
  estado: EstadoEntrada;
  validadaAt: string | null;
  adultoRequerido: boolean;
  estadoVenta: EstadoVenta;
  candyEntregadoAt: string | null;
  funcion: FuncionEntrada;
  candy: ItemCandy[];
}

export interface LecturaQr {
  concepto: ConceptoValidacion;
  codigoQr: string;
  entrada: EntradaEscaneada | null;
  resultado: ResultadoValidacion | null;
  motivoRechazo: string | null;
}

export interface UsoQr {
  id: string;
  codigoQr: string;
  concepto: ConceptoValidacion;
  resultado: ResultadoValidacion;
  creadoAt: string;
  peliculaNombre: string | null;
  butaca: string | null;
}

export interface NuevoUsoQr {
  codigoQr: string;
  entradaId: string | null;
  concepto: ConceptoValidacion;
  resultado: ResultadoValidacion;
}
