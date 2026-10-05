import { EntradaImprimible, EstadoEntrada, FuncionEntrada } from '../../../core/modelos/entrada.model';

export interface EntradaUsuario extends EntradaImprimible {
  id: string;
  estado: EstadoEntrada;
}

export interface FuncionConEntradas {
  id: string;
  fin: string;
  funcion: FuncionEntrada;
  entradas: EntradaUsuario[];
}
