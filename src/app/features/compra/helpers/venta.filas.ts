import { SolicitudCompra } from '../modelos/pago.model';

export interface FilaComboItem {
  combo_id: string;
  producto_id: string;
  cantidad: number;
}

export interface FilaItemVenta {
  id: string;
  venta_id: string;
  tipo_item: 'entrada' | 'producto' | 'combo';
  funcion_id?: string;
  butaca_id?: string;
  producto_id?: string;
  combo_id?: string;
  cantidad: number;
  precio_unitario: number;
  total_linea: number;
}

export function filaVenta(ventaId: string, usuarioId: string | null, solicitud: SolicitudCompra) {
  return {
    id: ventaId,
    usuario_id: usuarioId,
    email_contacto: solicitud.emailContacto,
    fecha_nacimiento_comprador: usuarioId ? null : solicitud.fechaNacimiento,
    cupon_id: solicitud.cuponId,
    subtotal: solicitud.subtotal,
    descuento: solicitud.descuento,
    credito_usado: solicitud.credito,
    puntos_usados: solicitud.puntos,
    total: solicitud.total,
    estado: 'pendiente',
  };
}

export function filasItemsVenta(ventaId: string, solicitud: SolicitudCompra): FilaItemVenta[] {
  const entradas: FilaItemVenta[] = solicitud.entradas.map((entrada) => ({
    id: crypto.randomUUID(),
    venta_id: ventaId,
    tipo_item: 'entrada',
    funcion_id: solicitud.funcionId,
    butaca_id: entrada.butacaId,
    cantidad: 1,
    precio_unitario: entrada.precio,
    total_linea: entrada.precio,
  }));
  const productos: FilaItemVenta[] = solicitud.productos.map((producto) => ({
    id: crypto.randomUUID(),
    venta_id: ventaId,
    tipo_item: 'producto',
    producto_id: producto.id,
    cantidad: producto.cantidad,
    precio_unitario: producto.precioUnitario,
    total_linea: producto.precioUnitario * producto.cantidad,
  }));
  const combos: FilaItemVenta[] = solicitud.combos.map((combo) => ({
    id: crypto.randomUUID(),
    venta_id: ventaId,
    tipo_item: 'combo',
    combo_id: combo.id,
    cantidad: combo.cantidad,
    precio_unitario: combo.precioUnitario,
    total_linea: combo.precioUnitario * combo.cantidad,
  }));
  return [...entradas, ...productos, ...combos];
}

export function filasEntradas(items: FilaItemVenta[], adultoRequerido: boolean) {
  return items
    .filter((item) => item.tipo_item === 'entrada')
    .map((item) => ({
      venta_item_id: item.id,
      codigo_qr: crypto.randomUUID().replace(/-/g, '').toUpperCase(),
      adulto_requerido: adultoRequerido,
    }));
}

export function filasPagos(ventaId: string, solicitud: SolicitudCompra) {
  return [
    { metodo: 'credito', monto: solicitud.credito, referencia_externa: null },
    { metodo: 'puntos', monto: solicitud.puntos, referencia_externa: null },
    { metodo: 'tarjeta', monto: solicitud.totalAPagar, referencia_externa: solicitud.referenciaPago },
  ]
    .filter((pago) => pago.monto > 0)
    .map((pago) => ({ ...pago, venta_id: ventaId, estado: 'aprobado' }));
}

export function filasMovimientosPuntos(usuarioId: string, ventaId: string, solicitud: SolicitudCompra) {
  const puntosAcreditados = Math.floor(solicitud.totalAPagar);
  return [
    { tipo: 'debito', puntos: -solicitud.puntos },
    { tipo: 'acreditacion', puntos: puntosAcreditados },
  ]
    .filter((movimiento) => movimiento.puntos !== 0)
    .map((movimiento) => ({ ...movimiento, usuario_id: usuarioId, venta_id: ventaId }));
}

export function productosRequeridos(solicitud: SolicitudCompra, comboItems: FilaComboItem[]): Map<string, number> {
  const requeridos = new Map<string, number>();
  const sumar = (productoId: string, cantidad: number) =>
    requeridos.set(productoId, (requeridos.get(productoId) ?? 0) + cantidad);

  solicitud.productos.forEach((producto) => sumar(producto.id, producto.cantidad));
  for (const comboItem of comboItems) {
    const combo = solicitud.combos.find((item) => item.id === comboItem.combo_id);
    if (combo) sumar(comboItem.producto_id, comboItem.cantidad * combo.cantidad);
  }
  return requeridos;
}
