import { Component, signal } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: "app-encabezado",
  styleUrl: "./encabezado.scss",
  templateUrl: "./encabezado.html",
})
export class Encabezado {
  protected readonly menuAbierto = signal(false);

  protected alternarMenu(): void {
    this.menuAbierto.update((abierto) => !abierto);
  }

  protected cerrarMenu(): void {
    this.menuAbierto.set(false);
  }
}
