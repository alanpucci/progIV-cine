import { Component, OnInit, inject, signal } from "@angular/core";
import { CargaGlobalService } from "../../../../core/servicios/carga-global.service";
import { ComboAdministracion, ProductoAdministracion } from "../../modelos/candy-bar-administracion.model";
import { ProductosAdministracionService } from "../../servicios/productos-administracion.service";
import { CombosAdministracionService } from "../../servicios/combos-administracion.service";
import { mensajeDeError } from "../../helpers/errores-administracion";

interface CategoriaConProductos {
  categoria: string;
  productos: ProductoAdministracion[];
}

@Component({
  selector: "app-listado-candy-bar",
  standalone: false,
  styleUrl: "./listado-candy-bar.scss",
  templateUrl: "./listado-candy-bar.html",
})
export class ListadoCandyBar implements OnInit {
  private readonly productosService = inject(ProductosAdministracionService);
  private readonly combosService = inject(CombosAdministracionService);
  protected readonly cargaGlobal = inject(CargaGlobalService);

  protected readonly productos = signal<ProductoAdministracion[]>([]);
  protected readonly combos = signal<ComboAdministracion[]>([]);
  protected readonly idAEliminar = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    await this.ejecutar(() => this.cargar(), "No se pudo cargar el Candy bar.");
  }

  protected categoriasConProductos(): CategoriaConProductos[] {
    const categorias = new Map<string, ProductoAdministracion[]>();
    for (const producto of this.productos()) {
      categorias.set(producto.categoriaNombre, [...(categorias.get(producto.categoriaNombre) ?? []), producto]);
    }
    return [...categorias]
      .map(([categoria, productos]) => ({ categoria, productos }))
      .sort((a, b) => a.categoria.localeCompare(b.categoria));
  }

  protected precioSuelto(combo: ComboAdministracion): number {
    return combo.items.reduce((suma, item) => suma + item.productoPrecio * item.cantidad, 0);
  }

  protected detalleCombo(combo: ComboAdministracion): string {
    return combo.items.map((item) => `${item.cantidad} × ${item.productoNombre}`).join(" + ");
  }

  protected async alternarProducto(producto: ProductoAdministracion): Promise<void> {
    await this.ejecutar(async () => {
      await this.productosService.cambiarActivacion(producto.id, !producto.activo);
      await this.cargar();
    }, "No se pudo cambiar el estado del producto.");
  }

  protected async alternarCombo(combo: ComboAdministracion): Promise<void> {
    await this.ejecutar(async () => {
      await this.combosService.cambiarActivacion(combo.id, !combo.activo);
      await this.cargar();
    }, "No se pudo cambiar el estado del combo.");
  }

  protected async eliminarProducto(id: string): Promise<void> {
    await this.ejecutar(async () => {
      await this.productosService.eliminar(id);
      this.idAEliminar.set(null);
      await this.cargar();
    }, "No se pudo eliminar el producto.");
  }

  protected async eliminarCombo(id: string): Promise<void> {
    await this.ejecutar(async () => {
      await this.combosService.eliminar(id);
      this.idAEliminar.set(null);
      await this.cargar();
    }, "No se pudo eliminar el combo.");
  }

  private async cargar(): Promise<void> {
    const [productos, combos] = await Promise.all([
      this.productosService.obtenerListado(),
      this.combosService.obtenerListado(),
    ]);
    this.productos.set(productos);
    this.combos.set(combos);
  }

  private async ejecutar(tarea: () => Promise<void>, mensajeGenerico: string): Promise<void> {
    this.error.set(null);
    try {
      await this.cargaGlobal.envolver(tarea);
    } catch (error) {
      this.idAEliminar.set(null);
      this.error.set(mensajeDeError(error, mensajeGenerico));
    }
  }
}
