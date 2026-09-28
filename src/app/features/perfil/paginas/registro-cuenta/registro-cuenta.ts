import { Component, inject, signal } from "@angular/core";
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { AuthService } from "../../../../core/servicios/auth.service";
import { CargaGlobalService } from "../../../../core/servicios/carga-global.service";
import { COLORES_OJOS, ColorOjos, TIPOS_SANGRE, TipoSangre } from "../../../../core/modelos/usuario.model";
import { Boton } from "../../../../shared/componentes/boton/boton";
import {
  FECHA_NACIMIENTO_MINIMA,
  contrasenasCoinciden,
  fechaIsoLocal,
  fechaNacimientoValida,
  sinEspaciosVacios,
} from "../../validadores/registro.validadores";

const LARGO_MINIMO_CONTRASENA = 8;

@Component({
  imports: [ReactiveFormsModule, RouterLink, Boton],
  selector: "app-registro-cuenta",
  styleUrl: "./registro-cuenta.scss",
  templateUrl: "./registro-cuenta.html",
})
export class RegistroCuenta {
  private readonly auth = inject(AuthService);
  private readonly cargaGlobal = inject(CargaGlobalService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  protected readonly tiposSangre = TIPOS_SANGRE;
  protected readonly coloresOjos = COLORES_OJOS;
  protected readonly largoMinimoContrasena = LARGO_MINIMO_CONTRASENA;
  protected readonly fechaMinima = FECHA_NACIMIENTO_MINIMA;
  protected readonly fechaMaxima = fechaIsoLocal(new Date());

  protected readonly intentoEnviar = signal(false);
  protected readonly errorEnvio = signal<string | null>(null);

  protected readonly formulario = this.fb.group(
    {
      email: ["", [Validators.required, Validators.email]],
      contrasena: ["", [Validators.required, Validators.minLength(LARGO_MINIMO_CONTRASENA)]],
      confirmacion: ["", Validators.required],
      nombre: ["", [Validators.required, Validators.maxLength(60), sinEspaciosVacios]],
      apellido: ["", [Validators.required, Validators.maxLength(60), sinEspaciosVacios]],
      fechaNacimiento: ["", [Validators.required, fechaNacimientoValida]],
      tipoSangre: ["" as TipoSangre | "", Validators.required],
      colorOjos: ["" as ColorOjos | "", Validators.required],
      diasVacacionesAnuales: ["", [Validators.required, Validators.max(365), Validators.pattern(/^\d+$/)]],
    },
    { validators: contrasenasCoinciden("contrasena", "confirmacion") },
  );

  protected mostrarError(control: AbstractControl): boolean {
    return control.invalid && (control.touched || this.intentoEnviar());
  }

  protected confirmacionNoCoincide(): boolean {
    const confirmacion = this.formulario.controls.confirmacion;
    return (
      this.formulario.hasError("contrasenasDistintas") && (confirmacion.touched || this.intentoEnviar())
    );
  }

  protected dejarSoloDigitos(evento: Event): void {
    const campo = evento.target as HTMLInputElement;
    const soloDigitos = campo.value.replace(/\D/g, "");
    if (soloDigitos !== campo.value) {
      this.formulario.controls.diasVacacionesAnuales.setValue(soloDigitos);
    }
  }

  protected async enviar(): Promise<void> {
    this.intentoEnviar.set(true);
    this.errorEnvio.set(null);
    if (this.formulario.invalid) return;

    const valor = this.formulario.getRawValue();
    try {
      await this.cargaGlobal.envolver(() =>
        this.auth.registrar({
          email: (valor.email ?? "").trim(),
          contrasena: valor.contrasena ?? "",
          nombre: (valor.nombre ?? "").trim(),
          apellido: (valor.apellido ?? "").trim(),
          fechaNacimiento: valor.fechaNacimiento ?? "",
          tipoSangre: valor.tipoSangre as TipoSangre,
          colorOjos: valor.colorOjos as ColorOjos,
          diasVacacionesAnuales: Number(valor.diasVacacionesAnuales),
        }),
      );
      await this.router.navigateByUrl("/");
    } catch (error) {
      this.errorEnvio.set(error instanceof Error ? error.message : "No se pudo completar el registro.");
    }
  }
}
