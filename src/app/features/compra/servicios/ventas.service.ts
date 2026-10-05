import { Service, inject } from '@angular/core';
import { PostgrestError } from '@supabase/supabase-js';
import { SupabaseService } from '../../../core/servicios/supabase.service';
import { AuthService } from '../../../core/servicios/auth.service';
import { SolicitudCompra } from '../modelos/pago.model';
import {
  FilaComboItem,
  filaVenta,
  filasEntradas,
  filasItemsVenta,
  filasMovimientosPuntos,
  filasPagos,
  productosRequeridos,
} from '../helpers/venta.filas';

const CODIGO_REGISTRO_DUPLICADO = '23505';
const MENSAJE_BUTACA_VENDIDA = 'Alguna de las butacas ya fue vendida. Volvé al mapa y elegí otras.';
const MENSAJE_ERROR_GENERICO = 'No se pudo confirmar la compra. Intentá de nuevo.';

@Service()
export class VentasService {
  private readonly supabase = inject(SupabaseService).cliente;
  private readonly auth = inject(AuthService);

  async confirmarCompra(solicitud: SolicitudCompra): Promise<string> {
    await this.auth.cargarSesion();
    const usuarioId = this.auth.sesion()?.user.id ?? null;
    const stockRestante = await this.calcularStockRestante(solicitud);

    const ventaId = crypto.randomUUID();
    const items = filasItemsVenta(ventaId, solicitud);
    const pagos = filasPagos(ventaId, solicitud);

    await this.ejecutar(this.supabase.from('ventas').insert(filaVenta(ventaId, usuarioId, solicitud)));
    await this.ejecutar(this.supabase.from('venta_items').insert(items));
    await this.ejecutar(this.supabase.from('entradas').insert(filasEntradas(items, solicitud.adultoRequerido)));
    if (pagos.length > 0) {
      await this.ejecutar(this.supabase.from('pagos').insert(pagos));
    }
    if (usuarioId) {
      await this.registrarMovimientos(usuarioId, ventaId, solicitud);
    }
    for (const [productoId, stock] of stockRestante) {
      await this.ejecutar(this.supabase.from('productos').update({ stock }).eq('id', productoId));
    }
    await this.ejecutar(this.supabase.from('ventas').update({ estado: 'pagada' }).eq('id', ventaId));
    return ventaId;
  }

  private async calcularStockRestante(solicitud: SolicitudCompra): Promise<Map<string, number>> {
    let comboItems: FilaComboItem[] = [];
    if (solicitud.combos.length > 0) {
      const { data, error } = await this.supabase
        .from('combo_items')
        .select('combo_id, producto_id, cantidad')
        .in('combo_id', solicitud.combos.map((combo) => combo.id));
      if (error) throw new Error(MENSAJE_ERROR_GENERICO);
      comboItems = data;
    }

    const requeridos = productosRequeridos(solicitud, comboItems);
    if (requeridos.size === 0) return new Map();

    const { data, error } = await this.supabase
      .from('productos')
      .select('id, nombre, stock')
      .in('id', [...requeridos.keys()]);
    if (error) throw new Error(MENSAJE_ERROR_GENERICO);

    const restante = new Map<string, number>();
    const sinStock: string[] = [];
    for (const producto of data) {
      if (producto.stock === null) continue;
      const nuevoStock = producto.stock - (requeridos.get(producto.id) ?? 0);
      if (nuevoStock < 0) {
        sinStock.push(producto.nombre);
      } else {
        restante.set(producto.id, nuevoStock);
      }
    }
    if (sinStock.length > 0) throw new Error(`No hay stock suficiente de: ${sinStock.join(', ')}.`);
    return restante;
  }

  private async registrarMovimientos(usuarioId: string, ventaId: string, solicitud: SolicitudCompra): Promise<void> {
    if (solicitud.credito > 0) {
      await this.ejecutar(
        this.supabase
          .from('movimientos_credito')
          .insert({ usuario_id: usuarioId, venta_id: ventaId, tipo: 'uso', monto: -solicitud.credito }),
      );
    }
    const movimientosPuntos = filasMovimientosPuntos(usuarioId, ventaId, solicitud);
    if (movimientosPuntos.length > 0) {
      await this.ejecutar(this.supabase.from('movimientos_puntos').insert(movimientosPuntos));
    }
  }

  private async ejecutar(consulta: PromiseLike<{ error: PostgrestError | null }>): Promise<void> {
    const { error } = await consulta;
    if (!error) return;
    throw new Error(error.code === CODIGO_REGISTRO_DUPLICADO ? MENSAJE_BUTACA_VENDIDA : MENSAJE_ERROR_GENERICO);
  }
}
