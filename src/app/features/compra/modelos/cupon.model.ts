export type TipoCupon = 'primera_compra' | 'edad' | 'general';

export interface CuponAplicado {
  id: string;
  codigo: string;
  porcentaje: number;
  tipo: TipoCupon;
  edadMinima: number | null;
  fechaInicio: string | null;
  fechaFin: string | null;
}
