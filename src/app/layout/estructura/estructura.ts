import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { Encabezado } from "../encabezado/encabezado";
import { Pie } from "../pie/pie";
import { SpinnerGlobal } from "../../shared/componentes/spinner-global/spinner-global";

@Component({
  imports: [RouterOutlet, Encabezado, Pie, SpinnerGlobal],
  selector: "app-estructura",
  styleUrl: "./estructura.scss",
  templateUrl: "./estructura.html",
})
export class Estructura {}
