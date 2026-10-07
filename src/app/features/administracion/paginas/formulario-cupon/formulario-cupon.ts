import { Component, OnInit, inject, signal } from "@angular/core";
import { AbstractControl, FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { CargaGlobalService } from "../../../../core/servicios/carga-global.service";
import { TipoCupon } from "../../modelos/cupon-administracion.model";
import { CuponesAdministracionService } from "../../servicios/cupones-administracion.service";
import { edadMinimaRequerida, vigenciaOrdenada } from "../../validadores/cupon.validadores";
import { mensajeDeError } from "../../helpers/errores-administracion";
import { fechaIsoLocal } from "../../../../shared/validadores/fecha.validadores";

const CODIGO_CUPON = /^[A-Za-z0-9_-]+$/;
const ENTERO_POSITIVO = /^\d+$/;

@Component({
  selector: "app-formulario-cupon",
  standalone: false,
  styleUrl: "./formulario-cupon.scss",
  templateUrl: "./formulario-cupon.html",
})
export class FormularioCupon implements OnInit {
  private readonly cuponesService = inject(CuponesAdministracionService);
  protected readonly cargaGlobal = inject(CargaGlobalService);
  private readonly fb = inject(FormBuilder);
  private readonly ruta = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly tipos: { valor: TipoCupon; etiqueta: string; ayuda: string }[] = [
    { valor: "general", etiqueta: "General", ayuda: "Lo usa cualquiera que ingrese el código." },
    {
      valor: "primera_compra",
      etiqueta: "Primera compra",
      ayuda: "Se aplica solo en la primera compra de una cuenta registrada.",
    },
    { valor: "edad", etiqueta: "Por edad", ayuda: "Se aplica solo a cuentas que tengan la edad mínima." },
  ];

  protected readonly cuponId = signal("");
  protected readonly noEncontrado = signal(false);
  protected readonly intentoEnviar = signal(false);
  protected readonly errorEnvio = signal<string | null>(null);

  protected readonly formulario = this.fb.group(
    {
      codigo: ["", [Validators.required, Validators.pattern(CODIGO_CUPON)]],
      porcentaje: [null as number | null, [Validators.required, Validators.min(1), Validators.max(100)]],
      tipo: ["general" as TipoCupon, Validators.required],
      edadMinima: [
        { value: null as number | null, disabled: true },
        [Validators.min(1), Validators.pattern(ENTERO_POSITIVO)],
      ],
      activo: [true],
      fechaInicio: [""],
      fechaFin: [""],
    },
    { validators: [edadMinimaRequerida, vigenciaOrdenada] },
  );

  async ngOnInit(): Promise<void> {
    const id = this.ruta.snapshot.paramMap.get("id");
    if (!id) return;

    try {
      await this.cargaGlobal.envolver(() => this.cargarCupon(id));
    } catch (error) {
      this.errorEnvio.set(mensajeDeError(error, "No se pudieron cargar los datos del cupón."));
    }
  }

  protected edicion(): boolean {
    return this.cuponId() !== "";
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

  protected sincronizarEdadMinima(): void {
    const edad = this.formulario.controls.edadMinima;
    if (this.formulario.controls.tipo.value === "edad") {
      edad.enable();
    } else {
      edad.disable();
    }
  }

  protected async guardar(): Promise<void> {
    this.intentoEnviar.set(true);
    this.errorEnvio.set(null);
    if (this.formulario.invalid) return;

    const valores = this.formulario.value;
    const datos = {
      codigo: (valores.codigo ?? "").trim().toUpperCase(),
      porcentaje: Number(valores.porcentaje),
      tipo: valores.tipo ?? "general",
      edadMinima: valores.edadMinima ?? null,
      activo: valores.activo ?? true,
      fechaInicio: valores.fechaInicio ? new Date(`${valores.fechaInicio}T00:00:00`).toISOString() : null,
      fechaFin: valores.fechaFin ? new Date(`${valores.fechaFin}T23:59:59`).toISOString() : null,
    };

    try {
      await this.cargaGlobal.envolver(() =>
        this.edicion() ? this.cuponesService.actualizar(this.cuponId(), datos) : this.cuponesService.crear(datos),
      );
      this.router.navigate(["/administracion/cupones"]);
    } catch (error) {
      this.errorEnvio.set(mensajeDeError(error, "No se pudo guardar el cupón. Intentá de nuevo."));
    }
  }

  private async cargarCupon(id: string): Promise<void> {
    const cupon = await this.cuponesService.obtenerPorId(id);
    if (!cupon) {
      this.noEncontrado.set(true);
      return;
    }

    this.cuponId.set(cupon.id);
    this.formulario.setValue({
      codigo: cupon.codigo,
      porcentaje: cupon.porcentaje,
      tipo: cupon.tipo,
      edadMinima: cupon.edadMinima,
      activo: cupon.activo,
      fechaInicio: cupon.fechaInicio ? fechaIsoLocal(new Date(cupon.fechaInicio)) : "",
      fechaFin: cupon.fechaFin ? fechaIsoLocal(new Date(cupon.fechaFin)) : "",
    });
    this.sincronizarEdadMinima();
  }
}
