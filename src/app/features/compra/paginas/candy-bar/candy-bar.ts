import { Component, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import { CandyBarService } from "../../servicios/candy-bar.service";
import { CarritoService } from "../../servicios/carrito.service";
import { CargaGlobalService } from "../../../../core/servicios/carga-global.service";
import { CartaCandy, CategoriaProducto, ComboCandy, ProductoCandy } from "../../modelos/candy-bar.model";
import { TipoExtraCarrito } from "../../modelos/carrito.model";

@Component({
  selector: "app-candy-bar",
  standalone: false,
  styleUrl: "./candy-bar.scss",
  templateUrl: "./candy-bar.html",
})
export class CandyBar {
  private readonly router = inject(Router);
  private readonly candyBarService = inject(CandyBarService);
  private readonly cargaGlobal = inject(CargaGlobalService);
  protected readonly carrito = inject(CarritoService);

  protected readonly carta = signal<CartaCandy | null>(null);
  protected readonly error = signal(false);
  protected readonly filtro = signal("todo");

  constructor() {
    this.cargarCarta();
  }

  protected categoriasConProductos(): CategoriaProducto[] {
    const carta = this.carta();
    if (!carta) return [];
    return carta.categorias.filter((categoria) => this.productosDe(categoria.id).length > 0);
  }

  protected mostrarCombos(): boolean {
    const filtro = this.filtro();
    return (filtro === "todo" || filtro === "combos") && (this.carta()?.combos.length ?? 0) > 0;
  }

  protected categoriasVisibles(): CategoriaProducto[] {
    const filtro = this.filtro();
    if (filtro === "combos") return [];
    const categorias = this.categoriasConProductos();
    return filtro === "todo" ? categorias : categorias.filter((categoria) => categoria.id === filtro);
  }

  protected productosDe(categoriaId: string): ProductoCandy[] {
    return this.carta()?.productos.filter((producto) => producto.categoriaId === categoriaId) ?? [];
  }

  protected cantidad(tipo: TipoExtraCarrito, id: string): number {
    return this.carrito.cantidadDe(tipo, id);
  }

  protected agregarProducto(producto: ProductoCandy): void {
    this.carrito.agregar({ id: producto.id, tipo: "producto", nombre: producto.nombre, precioUnitario: producto.precio });
  }

  protected agregarCombo(combo: ComboCandy): void {
    this.carrito.agregar({ id: combo.id, tipo: "combo", nombre: combo.nombre, precioUnitario: combo.precio });
  }

  protected restar(tipo: TipoExtraCarrito, id: string): void {
    this.carrito.cambiarCantidad(tipo, id, this.cantidad(tipo, id) - 1);
  }

  protected irAlCarrito(): void {
    this.router.navigate(["/compra/carrito"]);
  }

  private async cargarCarta(): Promise<void> {
    try {
      this.carta.set(await this.cargaGlobal.envolver(() => this.candyBarService.obtenerCarta()));
    } catch {
      this.error.set(true);
    }
  }
}
