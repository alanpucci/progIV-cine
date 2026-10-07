import { Component, OnInit, inject, signal } from "@angular/core";
import { AbstractControl, FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { CargaGlobalService } from "../../../../core/servicios/carga-global.service";
import { CategoriaAdministracion } from "../../modelos/candy-bar-administracion.model";
import { ProductosAdministracionService } from "../../servicios/productos-administracion.service";
import { CategoriasProductoAdministracionService } from "../../servicios/categorias-producto-administracion.service";
import { mensajeDeError } from "../../helpers/errores-administracion";
import { sinEspaciosVacios } from "../../../../shared/validadores/texto.validadores";

const ENTERO_NO_NEGATIVO = /^\d+$/;

@Component({
  selector: "app-formulario-producto",
  standalone: false,
  styleUrl: "./formulario-producto.scss",
  templateUrl: "./formulario-producto.html",
})
export class FormularioProducto implements OnInit {
  private readonly productosService = inject(ProductosAdministracionService);
  private readonly categoriasService = inject(CategoriasProductoAdministracionService);
  protected readonly cargaGlobal = inject(CargaGlobalService);
  private readonly fb = inject(FormBuilder);
  private readonly ruta = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly productoId = signal("");
  protected readonly categorias = signal<CategoriaAdministracion[]>([]);
  protected readonly noEncontrado = signal(false);
  protected readonly intentoEnviar = signal(false);
  protected readonly errorEnvio = signal<string | null>(null);

  protected readonly formulario = this.fb.group({
    categoriaId: ["", Validators.required],
    nombre: ["", [Validators.required, sinEspaciosVacios]],
    descripcion: [""],
    precio: [null as number | null, [Validators.required, Validators.min(1)]],
    stock: [null as number | null, [Validators.min(0), Validators.pattern(ENTERO_NO_NEGATIVO)]],
    activo: [true],
  });

  async ngOnInit(): Promise<void> {
    try {
      await this.cargaGlobal.envolver(() => this.cargarDatos());
    } catch (error) {
      this.errorEnvio.set(mensajeDeError(error, "No se pudieron cargar los datos del producto."));
    }
  }

  protected edicion(): boolean {
    return this.productoId() !== "";
  }

  protected mostrarError(control: AbstractControl): boolean {
    return control.invalid && (control.touched || this.intentoEnviar());
  }

  protected async guardar(): Promise<void> {
    this.intentoEnviar.set(true);
    this.errorEnvio.set(null);
    if (this.formulario.invalid) return;

    const valores = this.formulario.value;
    const datos = {
      categoriaId: valores.categoriaId ?? "",
      nombre: (valores.nombre ?? "").trim(),
      descripcion: (valores.descripcion ?? "").trim(),
      precio: Number(valores.precio),
      stock: valores.stock ?? null,
      activo: valores.activo ?? true,
    };

    try {
      await this.cargaGlobal.envolver(() =>
        this.edicion()
          ? this.productosService.actualizar(this.productoId(), datos)
          : this.productosService.crear(datos),
      );
      this.router.navigate(["/administracion/candy-bar"]);
    } catch (error) {
      this.errorEnvio.set(mensajeDeError(error, "No se pudo guardar el producto. Intentá de nuevo."));
    }
  }

  private async cargarDatos(): Promise<void> {
    this.categorias.set(await this.categoriasService.obtenerListado());

    const id = this.ruta.snapshot.paramMap.get("id");
    if (!id) return;

    const producto = await this.productosService.obtenerPorId(id);
    if (!producto) {
      this.noEncontrado.set(true);
      return;
    }

    this.productoId.set(producto.id);
    this.formulario.setValue({
      categoriaId: producto.categoriaId,
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      stock: producto.stock,
      activo: producto.activo,
    });
  }
}
