import { Compra } from '../../../core/modelos/compra.model';

export interface VentaAdministracion extends Compra {
  email: string;
  cliente: string | null;
  motivoCancelacion: string | null;
  fechaCancelacion: string | null;
}
