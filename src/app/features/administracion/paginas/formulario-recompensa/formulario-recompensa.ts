import { Component, OnInit, inject, signal } from "@angular/core";
import { AbstractControl, FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { CargaGlobalService } from "../../../../core/servicios/carga-global.service";
import { TipoRecompensa } from "../../../../core/modelos/recompensa.model";
import { ProductoAdministracion } from "../../modelos/candy-bar-administracion.model";
import { RecompensasAdministracionService } from "../../servicios/recompensas-administracion.service";
import { ProductosAdministracionService } from "../../servicios/productos-administracion.service";
import { productoRequerido } from "../../validadores/recompensa.validadores";
import { mensajeDeError } from "../../helpers/errores-administracion";
import { sinEspaciosVacios } from "../../../../shared/validadores/texto.validadores";

const ENTERO_POSITIVO = /^\d+$/;

@Component({
  selector: "app-formulario-recompensa",
  standalone: false,
  styleUrl: "./formulario-recompensa.scss",
  templateUrl: "./formulario-recompensa.html",
})
export class FormularioRecompensa implements OnInit {
  private readonly recompensasService = inject(RecompensasAdministracionService);
  private readonly productosService = inject(ProductosAdministracionService);
  protected readonly cargaGlobal = inject(CargaGlobalService);
  private readonly fb = inject(FormBuilder);
  private readonly ruta = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly tipos: { valor: TipoRecompensa; etiqueta: string; ayuda: string }[] = [
    {
      valor: "entrada",
      etiqueta: "Entrada",
      ayuda: "Cubre una entrada de la compra, sea cual sea la función. Si hay varias, la de menor precio.",
    },
    { valor: "producto", etiqueta: "Producto", ayuda: "Suma el producto elegido a la compra, sin cargo." },
  ];

  protected readonly recompensaId = signal("");
  protected readonly productos = signal<ProductoAdministracion[]>([]);
  protected readonly noEncontrada = signal(false);
  protected readonly intentoEnviar = signal(false);
  protected readonly errorEnvio = signal<string | null>(null);

  protected readonly formulario = this.fb.group(
    {
      nombre: ["", [Validators.required, Validators.maxLength(80), sinEspaciosVacios]],
      tipo: ["entrada" as TipoRecompensa, Validators.required],
      productoId: [{ value: "", disabled: true }],
      puntosCosto: [null as number | null, [Validators.required, Validators.min(1), Validators.pattern(ENTERO_POSITIVO)]],
      activo: [true],
    },
    { validators: [productoRequerido] },
  );

  async ngOnInit(): Promise<void> {
    const id = this.ruta.snapshot.paramMap.get("id");
    try {
      await this.cargaGlobal.envolver(async () => {
        this.productos.set(await this.productosService.obtenerListado());
        if (id) await this.cargarRecompensa(id);
      });
    } catch (error) {
      this.errorEnvio.set(mensajeDeError(error, "No se pudieron cargar los datos de la recompensa."));
    }
  }

  protected edicion(): boolean {
    return this.recompensaId() !== "";
  }

  protected mostrarError(control: AbstractControl): boolean {
    return control.invalid && (control.touched || this.intentoEnviar());
  }

  protected mostrarErrorGrupo(error: string): boolean {
    return this.formulario.hasError(error) && this.intentoEnviar();
  }

  protected ayudaTipo(): string {
    return this.tipos.find((tipo) => tipo.valor === this.formulario.controls.tipo.value)?.ayuda ?? "";
  }

  protected productosElegibles(): ProductoAdministracion[] {
    const elegido = this.formulario.controls.productoId.value;
    return this.productos().filter((producto) => producto.activo || producto.id === elegido);
  }

  protected precioReferencia(): number | null {
    const elegido = this.formulario.controls.productoId.value;
    return this.productos().find((producto) => producto.id === elegido)?.precio ?? null;
  }

  protected sincronizarProducto(): void {
    const producto = this.formulario.controls.productoId;
    if (this.formulario.controls.tipo.value === "producto") {
      producto.enable();
    } else {
      producto.disable();
    }
  }

  protected async guardar(): Promise<void> {
    this.intentoEnviar.set(true);
    this.errorEnvio.set(null);
    if (this.formulario.invalid) return;

    const valores = this.formulario.value;
    const datos = {
      nombre: (valores.nombre ?? "").trim(),
      tipo: valores.tipo ?? "entrada",
      productoId: valores.productoId || null,
      puntosCosto: Number(valores.puntosCosto),
      activo: valores.activo ?? true,
    };

    try {
      await this.cargaGlobal.envolver(() =>
        this.edicion()
          ? this.recompensasService.actualizar(this.recompensaId(), datos)
          : this.recompensasService.crear(datos),
      );
      this.router.navigate(["/administracion/recompensas"]);
    } catch (error) {
      this.errorEnvio.set(mensajeDeError(error, "No se pudo guardar la recompensa. Intentá de nuevo."));
    }
  }

  private async cargarRecompensa(id: string): Promise<void> {
    const recompensa = await this.recompensasService.obtenerPorId(id);
    if (!recompensa) {
      this.noEncontrada.set(true);
      return;
    }

    this.recompensaId.set(recompensa.id);
    this.formulario.setValue({
      nombre: recompensa.nombre,
      tipo: recompensa.tipo,
      productoId: recompensa.productoId ?? "",
      puntosCosto: recompensa.puntosCosto,
      activo: recompensa.activo,
    });
    this.sincronizarProducto();
  }
}
