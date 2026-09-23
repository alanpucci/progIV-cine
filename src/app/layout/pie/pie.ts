import { Component } from "@angular/core";

@Component({
  imports: [],
  selector: "app-pie",
  styleUrl: "./pie.scss",
  templateUrl: "./pie.html",
})
export class Pie {
  protected readonly anioActual = new Date().getFullYear();
}
