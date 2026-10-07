import { Component, OnInit, inject, signal } from "@angular/core";
import { AbstractControl, FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { CargaGlobalService } from "../../../../core/servicios/carga-global.service";
import { ProductoAdministracion } from "../../modelos/candy-bar-administracion.model";
import { CombosAdministracionService } from "../../servicios/combos-administracion.service";
import { ProductosAdministracionService } from "../../servicios/productos-administracion.service";
import { mensajeDeError } from "../../helpers/errores-administracion";
import { sinEspaciosVacios } from "../../../../shared/validadores/texto.validadores";

const ENTERO_POSITIVO = /^\d+$/;

@Component({
  selector: "app-formulario-combo",
  standalone: false,
  styleUrl: "./formulario-combo.scss",
  templateUrl: "./formulario-combo.html",
})
export class FormularioCombo implements OnInit {
  private readonly combosService = inject(CombosAdministracionService);
  private readonly productosService = inject(ProductosAdministracionService);
  protected readonly cargaGlobal = inject(CargaGlobalService);
  private readonly fb = inject(FormBuilder);
  private readonly ruta = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly comboId = signal("");
  protected readonly productos = signal<ProductoAdministracion[]>([]);
  protected readonly noEncontrado = signal(false);
  protected readonly intentoEnviar = signal(false);
  protected readonly errorEnvio = signal<string | null>(null);

  protected readonly formulario = this.fb.group({
    nombre: ["", [Validators.required, sinEspaciosVacios]],
    descripcion: [""],
    precioFijo: [null as number | null, [Validators.required, Validators.min(1)]],
    destacado: [false],
    activo: [true],
    items: this.fb.array([this.crearItem()], Validators.minLength(1)),
  });

  async ngOnInit(): Promise<void> {
    try {
      await this.cargaGlobal.envolver(() => this.cargarDatos());
    } catch (error) {
      this.errorEnvio.set(mensajeDeError(error, "No se pudieron cargar los datos del combo."));
    }
  }

  protected edicion(): boolean {
    return this.comboId() !== "";
  }

  protected mostrarError(control: AbstractControl): boolean {
    return control.invalid && (control.touched || this.intentoEnviar());
  }

  protected agregarItem(): void {
    this.formulario.controls.items.push(this.crearItem());
  }

  protected quitarItem(indice: number): void {
    this.formulario.controls.items.removeAt(indice);
  }

  protected precioSuelto(): number {
    return this.formulario.controls.items.controls.reduce((suma, item) => {
      const producto = this.productos().find((opcion) => opcion.id === item.controls.productoId.value);
      return suma + (producto?.precio ?? 0) * Number(item.controls.cantidad.value ?? 0);
    }, 0);
  }

  protected ahorro(): number {
    return this.precioSuelto() - Number(this.formulario.controls.precioFijo.value ?? 0);
  }

  protected async guardar(): Promise<void> {
    this.intentoEnviar.set(true);
    this.errorEnvio.set(null);
    if (this.formulario.invalid) return;

    const valores = this.formulario.value;
    const datos = {
      nombre: (valores.nombre ?? "").trim(),
      descripcion: (valores.descripcion ?? "").trim(),
      precioFijo: Number(valores.precioFijo),
      destacado: valores.destacado ?? false,
      activo: valores.activo ?? true,
      items: (valores.items ?? []).map((item) => ({ productoId: item.productoId ?? "", cantidad: Number(item.cantidad) })),
    };

    try {
      await this.cargaGlobal.envolver(() =>
        this.edicion() ? this.combosService.actualizar(this.comboId(), datos) : this.combosService.crear(datos),
      );
      this.router.navigate(["/administracion/candy-bar"]);
    } catch (error) {
      this.errorEnvio.set(mensajeDeError(error, "No se pudo guardar el combo. Intentá de nuevo."));
    }
  }

  private crearItem(productoId = "", cantidad = 1) {
    return this.fb.group({
      productoId: [productoId, Validators.required],
      cantidad: [cantidad, [Validators.required, Validators.min(1), Validators.pattern(ENTERO_POSITIVO)]],
    });
  }

  private async cargarDatos(): Promise<void> {
    this.productos.set(await this.productosService.obtenerListado());

    const id = this.ruta.snapshot.paramMap.get("id");
    if (!id) return;

    const combo = await this.combosService.obtenerPorId(id);
    if (!combo) {
      this.noEncontrado.set(true);
      return;
    }

    this.comboId.set(combo.id);
    const items = this.formulario.controls.items;
    items.clear();
    combo.items.forEach((item) => items.push(this.crearItem(item.productoId, item.cantidad)));
    this.formulario.patchValue({
      nombre: combo.nombre,
      descripcion: combo.descripcion,
      precioFijo: combo.precioFijo,
      destacado: combo.destacado,
      activo: combo.activo,
    });
  }
}
