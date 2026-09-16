import { Component, input } from "@angular/core";

@Component({
  imports: [],
  selector: "app-tarjeta",
  styleUrl: "./tarjeta.scss",
  templateUrl: "./tarjeta.html",
})
export class Tarjeta {
  readonly interactiva = input(false);
}
