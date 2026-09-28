import { inject, Service, signal, WritableSignal } from '@angular/core';
import { SeleccionButacasService } from '../../../core/servicios/seleccion-butacas.service';
import { ButacaElegida, SeleccionButacas } from '../../../core/modelos/funcion.model';
import { ExtraCarrito, ExtrasCarrito, TipoExtraCarrito } from '../modelos/carrito.model';
import { CuponAplicado } from '../modelos/cupon.model';
import { CuponesService } from './cupones.service';

const CLAVE_ALMACENAMIENTO = 'cine.carrito-extras';
const CLAVE_CUPON = 'cine.carrito-cupon';

@Service()
export class CarritoService {
  private readonly seleccionButacas = inject(SeleccionButacasService);
  private readonly cupones = inject(CuponesService);
  private readonly almacenados = this.leerAlmacenados();

  readonly productos = signal<ExtraCarrito[]>(this.almacenados.productos);
  readonly combos = signal<ExtraCarrito[]>(this.almacenados.combos);
  readonly cupon = signal<CuponAplicado | null>(this.leerCupon());

  seleccion(): SeleccionButacas | null {
    return this.seleccionButacas.seleccion();
  }

  entradas(): ButacaElegida[] {
    return this.seleccion()?.butacas ?? [];
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
    const cupon = this.cupon();
    try {
      if (cupon) {
        sessionStorage.setItem(CLAVE_CUPON, JSON.stringify(cupon));
      } else {
        sessionStorage.removeItem(CLAVE_CUPON);
      }
    } catch {
      return;
    }
  }

  private leerCupon(): CuponAplicado | null {
    try {
      const guardado = sessionStorage.getItem(CLAVE_CUPON);
      return guardado ? (JSON.parse(guardado) as CuponAplicado) : null;
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
