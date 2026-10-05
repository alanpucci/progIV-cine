import { inject, Service, signal, WritableSignal } from '@angular/core';
import { SeleccionButacasService } from '../../../core/servicios/seleccion-butacas.service';
import { ButacaElegida, SeleccionButacas } from '../../../core/modelos/funcion.model';
import {
  ExtraCarrito,
  ExtrasCarrito,
  SaldosAplicados,
  TipoExtraCarrito,
  VALOR_PUNTO_EN_PESOS,
} from '../modelos/carrito.model';
import { CuponAplicado } from '../modelos/cupon.model';
import { Comprador } from '../modelos/comprador.model';
import { CompraRegistrada, SolicitudCompra } from '../modelos/pago.model';
import { CompraConfirmada } from '../modelos/confirmacion.model';
import { CuponesService } from './cupones.service';

const CLAVE_ALMACENAMIENTO = 'cine.carrito-extras';
const CLAVE_CUPON = 'cine.carrito-cupon';
const CLAVE_COMPRADOR = 'cine.carrito-comprador';
const CLAVE_SALDOS = 'cine.carrito-saldos';
const CLAVE_ULTIMA_COMPRA = 'cine.ultima-compra';

@Service()
export class CarritoService {
  private readonly seleccionButacas = inject(SeleccionButacasService);
  private readonly cupones = inject(CuponesService);
  private readonly almacenados = this.leerAlmacenados();

  readonly productos = signal<ExtraCarrito[]>(this.almacenados.productos);
  readonly combos = signal<ExtraCarrito[]>(this.almacenados.combos);
  readonly cupon = signal<CuponAplicado | null>(this.leerDeSesion<CuponAplicado>(CLAVE_CUPON));
  readonly comprador = signal<Comprador | null>(this.leerDeSesion<Comprador>(CLAVE_COMPRADOR));
  readonly saldosAplicados = signal<SaldosAplicados | null>(this.leerDeSesion<SaldosAplicados>(CLAVE_SALDOS));
  readonly ultimaCompra = signal<CompraConfirmada | null>(this.leerDeSesion<CompraConfirmada>(CLAVE_ULTIMA_COMPRA));

  seleccion(): SeleccionButacas | null {
    return this.seleccionButacas.seleccion();
  }

  entradas(): ButacaElegida[] {
    return this.seleccion()?.butacas ?? [];
  }

  edadMinimaRequerida(): number | null {
    return this.seleccion()?.funcion.clasificacionEdad ?? null;
  }

  extras(): ExtraCarrito[] {
    return [...this.combos(), ...this.productos()];
  }

  cantidadDe(tipo: TipoExtraCarrito, id: string): number {
    return this.listaPara(tipo)().find((item) => item.id === id)?.cantidad ?? 0;
  }

  cantidadExtras(): number {
    return this.extras().reduce((suma, item) => suma + item.cantidad, 0);
  }

  agregar(extra: Omit<ExtraCarrito, 'cantidad'>, cantidad = 1): void {
    const lista = this.listaPara(extra.tipo);
    const existente = lista().find((item) => item.id === extra.id);
    if (existente) {
      this.cambiarCantidad(extra.tipo, extra.id, existente.cantidad + cantidad);
      return;
    }
    lista.update((items) => [...items, { ...extra, cantidad }]);
    this.guardar();
  }

  cambiarCantidad(tipo: TipoExtraCarrito, id: string, cantidad: number): void {
    if (cantidad <= 0) {
      this.quitar(tipo, id);
      return;
    }
    this.listaPara(tipo).update((items) => items.map((item) => (item.id === id ? { ...item, cantidad } : item)));
    this.guardar();
  }

  quitar(tipo: TipoExtraCarrito, id: string): void {
    this.listaPara(tipo).update((items) => items.filter((item) => item.id !== id));
    this.guardar();
  }

  subtotalEntradas(): number {
    return this.seleccionButacas.total();
  }

  subtotalExtras(): number {
    return this.extras().reduce((suma, item) => suma + item.precioUnitario * item.cantidad, 0);
  }

  subtotal(): number {
    return this.subtotalEntradas() + this.subtotalExtras();
  }

  descuento(): number {
    const cupon = this.cupon();
    if (!cupon) return 0;
    return Math.round(this.subtotal() * cupon.porcentaje) / 100;
  }

  total(): number {
    return this.subtotal() - this.descuento();
  }

  creditoUsado(): number {
    return Math.min(this.saldosAplicados()?.credito ?? 0, this.total());
  }

  puntosUsados(): number {
    const restante = this.total() - this.creditoUsado();
    return Math.min(this.saldosAplicados()?.puntos ?? 0, Math.floor(restante / VALOR_PUNTO_EN_PESOS));
  }

  montoCubiertoPorPuntos(): number {
    return this.puntosUsados() * VALOR_PUNTO_EN_PESOS;
  }

  totalAPagar(): number {
    return Math.round((this.total() - this.creditoUsado() - this.montoCubiertoPorPuntos()) * 100) / 100;
  }

  async aplicarCupon(codigo: string): Promise<void> {
    const cupon = await this.cupones.validar(codigo.trim().toUpperCase());
    this.cupon.set(cupon);
    this.guardarCupon();
  }

  async aplicarCuponAutomatico(): Promise<void> {
    if (this.cupon()) return;
    const cupon = await this.cupones.buscarCuponAutomatico();
    if (!cupon) return;
    this.cupon.set(cupon);
    this.guardarCupon();
  }

  quitarCupon(): void {
    this.cupon.set(null);
    this.guardarCupon();
  }

  guardarComprador(comprador: Comprador | null): void {
    this.comprador.set(comprador);
    this.guardarEnSesion(CLAVE_COMPRADOR, comprador);
  }

  aplicarSaldos(saldos: SaldosAplicados | null): void {
    const aplicados = saldos && (saldos.credito > 0 || saldos.puntos > 0) ? saldos : null;
    this.saldosAplicados.set(aplicados);
    this.guardarEnSesion(CLAVE_SALDOS, aplicados);
  }

  solicitudDeCompra(referenciaPago: string | null): SolicitudCompra | null {
    const seleccion = this.seleccion();
    const comprador = this.comprador();
    if (!seleccion || !comprador) return null;
    return {
      funcionId: seleccion.funcion.id,
      adultoRequerido: seleccion.funcion.clasificacionEdad !== null,
      entradas: seleccion.butacas.map((butaca) => ({ butacaId: butaca.id, precio: butaca.precio })),
      productos: this.productos().map(({ id, cantidad, precioUnitario }) => ({ id, cantidad, precioUnitario })),
      combos: this.combos().map(({ id, cantidad, precioUnitario }) => ({ id, cantidad, precioUnitario })),
      cuponId: this.cupon()?.id ?? null,
      emailContacto: comprador.emailContacto,
      fechaNacimiento: comprador.fechaNacimiento,
      subtotal: this.subtotal(),
      descuento: this.descuento(),
      credito: this.creditoUsado(),
      puntos: this.puntosUsados(),
      total: this.total(),
      totalAPagar: this.totalAPagar(),
      referenciaPago,
    };
  }

  guardarComprobante(registro: CompraRegistrada): void {
    const seleccion = this.seleccion();
    const comprador = this.comprador();
    if (!seleccion || !comprador) return;
    const comprobante: CompraConfirmada = {
      ventaId: registro.ventaId,
      confirmadaEn: new Date().toISOString(),
      registrada: registro.registrada,
      emailContacto: comprador.emailContacto,
      funcion: seleccion.funcion,
      entradas: seleccion.butacas.map((butaca) => ({ ...butaca, codigoQr: registro.codigosQr[butaca.id] })),
      extras: this.extras(),
      cuponCodigo: this.cupon()?.codigo ?? null,
      subtotal: this.subtotal(),
      descuento: this.descuento(),
      credito: this.creditoUsado(),
      puntos: this.puntosUsados(),
      montoPuntos: this.montoCubiertoPorPuntos(),
      totalAPagar: this.totalAPagar(),
      puntosAcreditados: registro.puntosAcreditados,
    };
    this.ultimaCompra.set(comprobante);
    this.guardarEnSesion(CLAVE_ULTIMA_COMPRA, comprobante);
  }

  cantidadItems(): number {
    return this.entradas().length + this.cantidadExtras();
  }

  estaVacio(): boolean {
    return this.cantidadItems() === 0;
  }

  vaciar(): void {
    this.productos.set([]);
    this.combos.set([]);
    this.guardar();
    this.quitarCupon();
    this.guardarComprador(null);
    this.aplicarSaldos(null);
    this.seleccionButacas.limpiar();
  }

  private listaPara(tipo: TipoExtraCarrito): WritableSignal<ExtraCarrito[]> {
    return tipo === 'producto' ? this.productos : this.combos;
  }

  private guardar(): void {
    const extras: ExtrasCarrito = { productos: this.productos(), combos: this.combos() };
    try {
      if (extras.productos.length === 0 && extras.combos.length === 0) {
        sessionStorage.removeItem(CLAVE_ALMACENAMIENTO);
      } else {
        sessionStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(extras));
      }
    } catch {
      return;
    }
  }

  private guardarCupon(): void {
    this.guardarEnSesion(CLAVE_CUPON, this.cupon());
  }

  private guardarEnSesion(clave: string, valor: unknown): void {
    try {
      if (valor) {
        sessionStorage.setItem(clave, JSON.stringify(valor));
      } else {
        sessionStorage.removeItem(clave);
      }
    } catch {
      return;
    }
  }

  private leerDeSesion<T>(clave: string): T | null {
    try {
      const guardado = sessionStorage.getItem(clave);
      return guardado ? (JSON.parse(guardado) as T) : null;
    } catch {
      return null;
    }
  }

  private leerAlmacenados(): ExtrasCarrito {
    try {
      const guardados = sessionStorage.getItem(CLAVE_ALMACENAMIENTO);
      return guardados ? (JSON.parse(guardados) as ExtrasCarrito) : { productos: [], combos: [] };
    } catch {
      return { productos: [], combos: [] };
    }
  }
}
