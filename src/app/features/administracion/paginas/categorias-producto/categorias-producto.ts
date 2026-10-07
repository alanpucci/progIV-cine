import { Component, OnInit, inject, signal } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { CargaGlobalService } from "../../../../core/servicios/carga-global.service";
import { CategoriaAdministracion } from "../../modelos/candy-bar-administracion.model";
import { CategoriasProductoAdministracionService } from "../../servicios/categorias-producto-administracion.service";
import { mensajeDeError } from "../../helpers/errores-administracion";
import { sinEspaciosVacios } from "../../../../shared/validadores/texto.validadores";

@Component({
  selector: "app-categorias-producto",
  standalone: false,
  styleUrl: "./categorias-producto.scss",
  templateUrl: "./categorias-producto.html",
})
export class CategoriasProducto implements OnInit {
  private readonly categoriasService = inject(CategoriasProductoAdministracionService);
  protected readonly cargaGlobal = inject(CargaGlobalService);
  private readonly fb = inject(FormBuilder);

  protected readonly categorias = signal<CategoriaAdministracion[]>([]);
  protected readonly categoriaEditando = signal<string | null>(null);
  protected readonly categoriaAEliminar = signal<string | null>(null);
  protected readonly intentoAgregar = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly formularioAlta = this.fb.nonNullable.group({
    nombre: ["", [Validators.required, sinEspaciosVacios]],
  });
  protected readonly formularioEdicion = this.fb.nonNullable.group({
    nombre: ["", [Validators.required, sinEspaciosVacios]],
  });

  async ngOnInit(): Promise<void> {
    await this.ejecutar(() => this.cargar(), "No se pudo cargar el listado de categorías.");
  }

  protected async agregar(): Promise<void> {
    this.intentoAgregar.set(true);
    if (this.formularioAlta.invalid) return;

    await this.ejecutar(async () => {
      await this.categoriasService.crear((this.formularioAlta.value.nombre ?? "").trim());
      this.formularioAlta.reset();
      this.intentoAgregar.set(false);
      await this.cargar();
    }, "No se pudo agregar la categoría.");
  }

  protected empezarEdicion(categoria: CategoriaAdministracion): void {
    this.categoriaAEliminar.set(null);
    this.categoriaEditando.set(categoria.id);
    this.formularioEdicion.setValue({ nombre: categoria.nombre });
  }

  protected async guardarEdicion(id: string): Promise<void> {
    if (this.formularioEdicion.invalid) return;

    await this.ejecutar(async () => {
      await this.categoriasService.renombrar(id, (this.formularioEdicion.value.nombre ?? "").trim());
      this.categoriaEditando.set(null);
      await this.cargar();
    }, "No se pudo renombrar la categoría.");
  }

  protected pedirEliminacion(id: string): void {
    this.categoriaEditando.set(null);
    this.categoriaAEliminar.set(id);
  }

  protected async confirmarEliminacion(id: string): Promise<void> {
    await this.ejecutar(async () => {
      await this.categoriasService.eliminar(id);
      this.categoriaAEliminar.set(null);
      await this.cargar();
    }, "No se pudo eliminar la categoría.");
  }

  private async cargar(): Promise<void> {
    this.categorias.set(await this.categoriasService.obtenerListado());
  }

  private async ejecutar(tarea: () => Promise<void>, mensajeGenerico: string): Promise<void> {
    this.error.set(null);
    try {
      await this.cargaGlobal.envolver(tarea);
    } catch (error) {
      this.error.set(mensajeDeError(error, mensajeGenerico));
    }
  }
}
