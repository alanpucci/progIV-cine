import { Recompensa } from '../../../core/modelos/recompensa.model';

export interface RecompensaAdministracion extends Recompensa {
  productoNombre: string | null;
  activo: boolean;
  cantidadCanjes: number;
}

export type DatosRecompensa = Omit<RecompensaAdministracion, 'id' | 'productoNombre' | 'cantidadCanjes'>;
