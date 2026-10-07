import { Component, OnInit, inject, signal } from "@angular/core";
import { AbstractControl, FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../../../../core/servicios/auth.service";
import { CargaGlobalService } from "../../../../core/servicios/carga-global.service";
import { PerfilesService } from "../../../../core/servicios/perfiles.service";
import {
  FECHA_NACIMIENTO_MINIMA,
  fechaIsoLocal,
  fechaNacimientoValida,
} from "../../../../shared/validadores/fecha.validadores";
import { CarritoService } from "../../servicios/carrito.service";
import { cumpleEdadMinima } from "../../helpers/edad.helpers";

@Component({
  selector: "app-datos-comprador",
  standalone: false,
  styleUrl: "./datos-comprador.scss",
  templateUrl: "./datos-comprador.html",
})
export class DatosComprador implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly perfiles = inject(PerfilesService);
  protected readonly cargaGlobal = inject(CargaGlobalService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  protected readonly carrito = inject(CarritoService);

  protected readonly fechaMinima = FECHA_NACIMIENTO_MINIMA;
  protected readonly fechaMaxima = fechaIsoLocal(new Date());

  protected readonly fechaNacimientoPerfil = signal<string | null>(null);
  protected readonly usuarioId = signal("");
  protected readonly intentoEnviar = signal(false);
  protected readonly errorEnvio = signal<string | null>(null);

  protected readonly formulario = this.fb.group({
    email: ["", [Validators.required, Validators.email]],
    fechaNacimiento: ["", [Validators.required, fechaNacimientoValida]],
  });

  async ngOnInit(): Promise<void> {
    try {
      await this.cargaGlobal.envolver(() => this.cargarDatos());
    } catch {
      this.errorEnvio.set("No se pudieron cargar tus datos. Intentá de nuevo.");
    }
  }

  protected registrado(): boolean {
    return this.fechaNacimientoPerfil() !== null;
  }

  protected mostrarError(control: AbstractControl): boolean {
    return control.invalid && (control.touched || this.intentoEnviar());
  }

  protected continuar(): void {
    this.intentoEnviar.set(true);
    this.errorEnvio.set(null);
    if (this.formulario.invalid) return;

    const { email, fechaNacimiento } = this.formulario.value;
    const fechaComprador = this.fechaNacimientoPerfil() ?? fechaNacimiento ?? "";
    const edadMinima = this.carrito.edadMinimaRequerida();
    if (!cumpleEdadMinima(fechaComprador, edadMinima)) {
      this.errorEnvio.set(`Esta película es para mayores de ${edadMinima} años. No podés continuar con la compra.`);
      return;
    }

    this.carrito.guardarComprador({
      emailContacto: (email ?? "").trim(),
      fechaNacimiento: this.registrado() ? null : fechaComprador,
    });
    this.router.navigate(["/compra/pago"]);
  }

  private async cargarDatos(): Promise<void> {
    await this.auth.cargarSesion();
    const sesion = this.auth.sesion();
    const guardado = this.carrito.comprador();

    if (sesion) {
      const perfil = await this.perfiles.obtener(sesion.user.id);
      this.usuarioId.set(sesion.user.id);
      this.fechaNacimientoPerfil.set(perfil.fechaNacimiento);
      this.formulario.controls.fechaNacimiento.disable();
      this.formulario.patchValue({
        email: guardado?.emailContacto ?? sesion.user.email ?? "",
        fechaNacimiento: perfil.fechaNacimiento,
      });
      return;
    }

    this.carrito.aplicarSaldos(null);
    this.carrito.quitarCanjes();
    if (guardado) {
      this.formulario.patchValue({
        email: guardado.emailContacto,
        fechaNacimiento: guardado.fechaNacimiento ?? "",
      });
    }
  }
}
