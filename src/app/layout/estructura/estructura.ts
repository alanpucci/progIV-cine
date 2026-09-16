import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { Encabezado } from "../encabezado/encabezado";
import { Pie } from "../pie/pie";

@Component({
  imports: [RouterOutlet, Encabezado, Pie],
  selector: "app-estructura",
  styleUrl: "./estructura.scss",
  templateUrl: "./estructura.html",
})
export class Estructura {}
