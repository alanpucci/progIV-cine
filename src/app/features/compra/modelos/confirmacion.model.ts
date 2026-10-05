import { ButacaElegida, FuncionMapa } from '../../../core/modelos/funcion.model';
import { ExtraCarrito } from './carrito.model';

export interface EntradaEmitida extends ButacaElegida {
  codigoQr: string;
}

export interface CompraConfirmada {
  ventaId: string;
  confirmadaEn: string;
  registrada: boolean;
  emailContacto: string;
  funcion: FuncionMapa;
  entradas: EntradaEmitida[];
  extras: ExtraCarrito[];
  cuponCodigo: string | null;
  subtotal: number;
  descuento: number;
  credito: number;
  puntos: number;
  montoPuntos: number;
  totalAPagar: number;
  puntosAcreditados: number;
}
