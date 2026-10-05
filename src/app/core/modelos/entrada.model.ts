import { Idioma, TipoButaca, TipoProyeccion } from './funcion.model';

export interface FuncionEntrada {
  peliculaNombre: string;
  clasificacionEdad: number | null;
  salaNombre: string;
  inicio: string;
  tipoProyeccion: TipoProyeccion;
  idioma: Idioma;
}

export interface EntradaImprimible {
  fila: string;
  numero: number;
  tipo: TipoButaca;
  codigoQr: string;
}
