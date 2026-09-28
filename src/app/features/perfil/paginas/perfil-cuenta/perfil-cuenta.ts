import { Component, inject, signal } from "@angular/core";
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthService } from "../../../../core/servicios/auth.service";
import { CargaGlobalService } from "../../../../core/servicios/carga-global.service";
import { PerfilesService } from "../../../../core/servicios/perfiles.service";
import {
  COLORES_OJOS,
  ColorOjos,
  DatosPerfil,
  TIPOS_SANGRE,
  TipoSangre,
} from "../../../../core/modelos/usuario.model";
import { Boton } from "../../../../shared/componentes/boton/boton";
import {
  FECHA_NACIMIENTO_MINIMA,
  fechaIsoLocal,
  fechaNacimientoValida,
  sinEspaciosVacios,
} from "../../validadores/registro.validadores";

@Component({
  imports: [ReactiveFormsModule, Boton],
  selector: "app-perfil-cuenta",
  styleUrl: "./perfil-cuenta.scss",
  templateUrl: "./perfil-cuenta.html",
})
export class PerfilCuenta {
  private readonly auth = inject(AuthService);
  private readonly perfiles = inject(PerfilesService);
  private readonly cargaGlobal = inject(CargaGlobalService);
  private readonly fb = inject(FormBuilder);

  protected readonly tiposSangre = TIPOS_SANGRE;
  protected readonly coloresOjos = COLORES_OJOS;
  protected readonly fechaMinima = FECHA_NACIMIENTO_MINIMA;
  protected readonly fechaMaxima = fechaIsoLocal(new Date());

  protected readonly perfil = signal<DatosPerfil | null>(null);
  protected readonly errorCarga = signal<string | null>(null);
  protected readonly intentoEnviar = signal(false);
  protected readonly errorEnvio = signal<string | null>(null);
  protected readonly guardadoOk = signal(false);

  protected readonly formulario = this.fb.group({
    nombre: ["", [Validators.required, Validators.maxLength(60), sinEspaciosVacios]],
    apellido: ["", [Validators.required, Validators.maxLength(60), sinEspaciosVacios]],
    fechaNacimiento: ["", [Validators.required, fechaNacimientoValida]],
    tipoSangre: ["" as TipoSangre | "", Validators.required],
    colorOjos: ["" as ColorOjos | "", Validators.required],
    diasVacacionesAnuales: ["", [Validators.required, Validators.max(365), Validators.pattern(/^\d+$/)]],
  });

  constructor() {
    void this.cargar();
  }

  protected email(): string {
    return this.auth.sesion()?.user.email ?? "";
  }

  protected iniciales(): string {
    const perfil = this.perfil();
    return perfil ? `${perfil.nombre.charAt(0)}${perfil.apellido.charAt(0)}`.toUpperCase() : "";
  }

  protected mostrarError(control: AbstractControl): boolean {
    return control.invalid && (control.touched || this.intentoEnviar());
  }

  protected dejarSoloDigitos(evento: Event): void {
    const campo = evento.target as HTMLInputElement;
    const soloDigitos = campo.value.replace(/\D/g, "");
    if (soloDigitos !== campo.value) {
      this.formulario.controls.diasVacacionesAnuales.setValue(soloDigitos);
    }
  }

  protected descartar(): void {
    const perfil = this.perfil();
    if (perfil) this.volcarEnFormulario(perfil);
    this.intentoEnviar.set(false);
    this.errorEnvio.set(null);
  }

  protected async guardar(): Promise<void> {
    this.intentoEnviar.set(true);
    this.errorEnvio.set(null);
    this.guardadoOk.set(false);
    const usuarioId = this.auth.sesion()?.user.id;
    if (this.formulario.invalid || !usuarioId) return;

    const valor = this.formulario.getRawValue();
    const datos: DatosPerfil = {
      nombre: (valor.nombre ?? "").trim(),
      apellido: (valor.apellido ?? "").trim(),
      fechaNacimiento: valor.fechaNacimiento ?? "",
      tipoSangre: valor.tipoSangre as TipoSangre,
      colorOjos: valor.colorOjos as ColorOjos,
      diasVacacionesAnuales: Number(valor.diasVacacionesAnuales),
    };

    try {
      await this.cargaGlobal.envolver(() => this.perfiles.actualizar(usuarioId, datos));
      this.perfil.set(datos);
      this.volcarEnFormulario(datos);
      this.intentoEnviar.set(false);
      this.guardadoOk.set(true);
    } catch {
      this.errorEnvio.set("No se pudieron guardar los cambios. Intentá de nuevo.");
    }
  }

  private async cargar(): Promise<void> {
    const usuarioId = this.auth.sesion()?.user.id;
    if (!usuarioId) return;
    try {
      const perfil = await this.cargaGlobal.envolver(() => this.perfiles.obtener(usuarioId));
      this.perfil.set(perfil);
      this.volcarEnFormulario(perfil);
    } catch {
      this.errorCarga.set("No se pudieron cargar tus datos. Recargá la página para intentar de nuevo.");
    }
  }

  private volcarEnFormulario(perfil: DatosPerfil): void {
    this.formulario.reset({
      nombre: perfil.nombre,
      apellido: perfil.apellido,
      fechaNacimiento: perfil.fechaNacimiento,
      tipoSangre: perfil.tipoSangre,
      colorOjos: perfil.colorOjos,
      diasVacacionesAnuales: String(perfil.diasVacacionesAnuales),
    });
  }
}
