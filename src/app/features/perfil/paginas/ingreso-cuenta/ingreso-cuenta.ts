import { Component, inject, signal } from "@angular/core";
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { AuthService } from "../../../../core/servicios/auth.service";
import { CargaGlobalService } from "../../../../core/servicios/carga-global.service";
import { Boton } from "../../../../shared/componentes/boton/boton";

@Component({
  imports: [ReactiveFormsModule, RouterLink, Boton],
  selector: "app-ingreso-cuenta",
  styleUrl: "./ingreso-cuenta.scss",
  templateUrl: "./ingreso-cuenta.html",
})
export class IngresoCuenta {
  private readonly auth = inject(AuthService);
  private readonly cargaGlobal = inject(CargaGlobalService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);

  protected readonly intentoEnviar = signal(false);
  protected readonly errorEnvio = signal<string | null>(null);

  protected readonly formulario = this.fb.group({
    email: ["", [Validators.required, Validators.email]],
    contrasena: ["", Validators.required],
  });

  protected mostrarError(control: AbstractControl): boolean {
    return control.invalid && (control.touched || this.intentoEnviar());
  }

  protected async enviar(): Promise<void> {
    this.intentoEnviar.set(true);
    this.errorEnvio.set(null);
    if (this.formulario.invalid) return;

    const { email, contrasena } = this.formulario.value;
    try {
      await this.cargaGlobal.envolver(() => this.auth.iniciarSesion((email ?? "").trim(), contrasena ?? ""));
      const volverA = this.ruta.snapshot.queryParamMap.get("volverA");
      await this.router.navigateByUrl(volverA?.startsWith("/") ? volverA : "/");
    } catch (error) {
      this.errorEnvio.set(error instanceof Error ? error.message : "No se pudo iniciar sesión.");
      this.formulario.controls.contrasena.reset();
    }
  }
}
