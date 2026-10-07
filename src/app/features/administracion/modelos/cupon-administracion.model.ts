export type TipoCupon = 'primera_compra' | 'edad' | 'general';

export interface CuponAdministracion {
  id: string;
  codigo: string;
  porcentaje: number;
  tipo: TipoCupon;
  edadMinima: number | null;
  activo: boolean;
  fechaInicio: string | null;
  fechaFin: string | null;
  cantidadUsos: number;
}

export type DatosCupon = Omit<CuponAdministracion, 'id' | 'cantidadUsos'>;
