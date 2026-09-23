export type TipoButaca = 'normal' | 'accesible' | 'vip';
export type TipoProyeccion = '2D' | '3D' | '4D' | '5D';
export type Idioma = 'castellano' | 'subtitulada';
export type EstadoFuncion = 'programada' | 'cancelada' | 'finalizada';

export interface Sala {
  id: string;
  nombre: string;
  activa: boolean;
}

export interface Butaca {
  id: string;
  salaId: string;
  fila: string;
  numero: number;
  tipo: TipoButaca;
  precioAdicional: number;
  activa: boolean;
}

export interface Funcion {
  id: string;
  peliculaId: string;
  salaId: string;
  inicio: string;
  fin: string;
  tipoProyeccion: TipoProyeccion;
  idioma: Idioma;
  precioBase: number;
  estado: EstadoFuncion;
}

export interface FuncionDisponible {
  id: string;
  salaId: string;
  salaNombre: string;
  inicio: string;
  tipoProyeccion: TipoProyeccion;
  idioma: Idioma;
  precioBase: number;
}

export interface FuncionMapa {
  id: string;
  peliculaId: string;
  peliculaNombre: string;
  salaId: string;
  salaNombre: string;
  inicio: string;
  tipoProyeccion: TipoProyeccion;
  idioma: Idioma;
  precioBase: number;
}

export interface ReservaButaca {
  id: string;
  funcionId: string;
  butacaId: string;
  sesionId: string;
  expiraAt: string;
  creadaEn: string;
}
