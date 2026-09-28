import { Component, inject, signal } from "@angular/core";
import { Router, RouterLink, RouterLinkActive } from "@angular/router";
import { AuthService } from "../../core/servicios/auth.service";

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: "app-encabezado",
  styleUrl: "./encabezado.scss",
  templateUrl: "./encabezado.html",
})
export class Encabezado {
  private readonly router = inject(Router);
  protected readonly auth = inject(AuthService);

  protected readonly menuAbierto = signal(false);
  protected readonly cerrandoSesion = signal(false);

  protected alternarMenu(): void {
    this.menuAbierto.update((abierto) => !abierto);
  }

  protected cerrarMenu(): void {
    this.menuAbierto.set(false);
  }

  protected async cerrarSesion(): Promise<void> {
    if (this.cerrandoSesion()) return;
    this.cerrarMenu();
    this.cerrandoSesion.set(true);
    try {
      await this.auth.cerrarSesion();
    } catch {
    } finally {
      this.cerrandoSesion.set(false);
      await this.router.navigateByUrl("/");
    }
  }
}
