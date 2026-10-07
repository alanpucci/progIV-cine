import { Component } from "@angular/core";
import { SECCIONES_ADMINISTRACION } from "../../modelos/seccion-administracion.model";

@Component({
  selector: "app-panel-administracion",
  standalone: false,
  styleUrl: "./panel-administracion.scss",
  templateUrl: "./panel-administracion.html",
})
export class PanelAdministracion {
  protected readonly secciones = SECCIONES_ADMINISTRACION;

  protected numeroRollo(indice: number): string {
    return String(indice + 1).padStart(2, "0");
  }
}
