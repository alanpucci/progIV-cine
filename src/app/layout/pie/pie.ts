import { Component } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: "app-pie",
  styleUrl: "./pie.scss",
  templateUrl: "./pie.html",
})
export class Pie {
  protected readonly anioActual = new Date().getFullYear();
}
