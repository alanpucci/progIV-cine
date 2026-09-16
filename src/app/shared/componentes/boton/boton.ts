import { Component, input } from "@angular/core";

export type VarianteBoton = "primario" | "secundario" | "fantasma";
export type TamanoBoton = "chico" | "mediano" | "grande";

@Component({
  imports: [],
  selector: "app-boton",
  styleUrl: "./boton.scss",
  templateUrl: "./boton.html",
})
export class Boton {
  readonly variante = input<VarianteBoton>("primario");
  readonly tamano = input<TamanoBoton>("mediano");
  readonly tipo = input<"button" | "submit" | "reset">("button");
  readonly deshabilitado = input(false);
}
