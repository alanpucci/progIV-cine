import { SolicitudCompra } from '../modelos/pago.model';

export interface FilaComboItem {
  combo_id: string;
  producto_id: string;
  cantidad: number;
}

export interface FilaItemVenta {
  id: string;
  venta_id: string;
  tipo_item: 'entrada' | 'producto' | 'combo' | 'recompensa';
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
  const recompensas: FilaItemVenta[] = solicitud.canjes
    .filter((canje) => canje.productoId !== null)
    .map((canje) => ({
      id: crypto.randomUUID(),
      venta_id: ventaId,
      tipo_item: 'recompensa',
      producto_id: canje.productoId ?? undefined,
      cantidad: 1,
      precio_unitario: 0,
      total_linea: 0,
    }));
  return [...entradas, ...productos, ...combos, ...recompensas];
}

export interface FilaEntrada {
  venta_item_id: string;
  codigo_qr: string;
  adulto_requerido: boolean;
}

export function filasEntradas(items: FilaItemVenta[], adultoRequerido: boolean): FilaEntrada[] {
  return items
    .filter((item) => item.tipo_item === 'entrada')
    .map((item) => ({
      venta_item_id: item.id,
      codigo_qr: crypto.randomUUID().replace(/-/g, '').toUpperCase(),
      adulto_requerido: adultoRequerido,
    }));
}

export function codigosQrPorButaca(items: FilaItemVenta[], entradas: FilaEntrada[]): Record<string, string> {
  const codigos: Record<string, string> = {};
  for (const entrada of entradas) {
    const item = items.find((fila) => fila.id === entrada.venta_item_id);
    if (item?.butaca_id) codigos[item.butaca_id] = entrada.codigo_qr;
  }
  return codigos;
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

export function puntosAcreditados(solicitud: SolicitudCompra): number {
  return Math.floor(solicitud.totalAPagar);
}

export function filasMovimientosPuntos(usuarioId: string, ventaId: string, solicitud: SolicitudCompra) {
  return [
    { tipo: 'debito', puntos: -solicitud.puntos },
    { tipo: 'acreditacion', puntos: puntosAcreditados(solicitud) },
  ]
    .filter((movimiento) => movimiento.puntos !== 0)
    .map((movimiento) => ({ ...movimiento, usuario_id: usuarioId, venta_id: ventaId }));
}

export interface FilaCanje {
  id: string;
  usuario_id: string;
  recompensa_id: string;
  venta_id: string;
  puntos_usados: number;
}

export function filasCanjes(usuarioId: string, ventaId: string, solicitud: SolicitudCompra): FilaCanje[] {
  return solicitud.canjes.map((canje) => ({
    id: crypto.randomUUID(),
    usuario_id: usuarioId,
    recompensa_id: canje.recompensaId,
    venta_id: ventaId,
    puntos_usados: canje.puntosCosto,
  }));
}

export function filasMovimientosCanjes(canjes: FilaCanje[]) {
  return canjes.map((canje) => ({
    usuario_id: canje.usuario_id,
    venta_id: canje.venta_id,
    canje_id: canje.id,
    tipo: 'debito',
    puntos: -canje.puntos_usados,
  }));
}

export function productosRequeridos(solicitud: SolicitudCompra, comboItems: FilaComboItem[]): Map<string, number> {
  const requeridos = new Map<string, number>();
  const sumar = (productoId: string, cantidad: number) =>
    requeridos.set(productoId, (requeridos.get(productoId) ?? 0) + cantidad);

  solicitud.productos.forEach((producto) => sumar(producto.id, producto.cantidad));
  solicitud.canjes.forEach((canje) => {
    if (canje.productoId) sumar(canje.productoId, 1);
  });
  for (const comboItem of comboItems) {
    const combo = solicitud.combos.find((item) => item.id === comboItem.combo_id);
    if (combo) sumar(comboItem.producto_id, comboItem.cantidad * combo.cantidad);
  }
  return requeridos;
}
