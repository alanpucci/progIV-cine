export interface EntradaSolicitud {
  butacaId: string;
  precio: number;
}

export interface ExtraSolicitud {
  id: string;
  cantidad: number;
  precioUnitario: number;
}

export interface SolicitudCompra {
  funcionId: string;
  adultoRequerido: boolean;
  entradas: EntradaSolicitud[];
  productos: ExtraSolicitud[];
  combos: ExtraSolicitud[];
  cuponId: string | null;
  emailContacto: string;
  fechaNacimiento: string | null;
  subtotal: number;
  descuento: number;
  credito: number;
  puntos: number;
  total: number;
  totalAPagar: number;
  referenciaPago: string | null;
}

export interface CompraRegistrada {
  ventaId: string;
  registrada: boolean;
  codigosQr: Record<string, string>;
  puntosAcreditados: number;
}
