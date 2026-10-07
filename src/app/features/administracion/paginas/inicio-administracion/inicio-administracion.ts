import { Component } from "@angular/core";
import { SECCIONES_ADMINISTRACION } from "../../modelos/seccion-administracion.model";

@Component({
  selector: "app-inicio-administracion",
  standalone: false,
  styleUrl: "./inicio-administracion.scss",
  templateUrl: "./inicio-administracion.html",
})
export class InicioAdministracion {
  protected readonly secciones = SECCIONES_ADMINISTRACION;
}
