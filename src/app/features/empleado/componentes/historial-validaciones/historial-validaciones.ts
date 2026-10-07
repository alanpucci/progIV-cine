import { Component, input } from "@angular/core";
import { formatearHoraFuncion } from "../../../../core/helpers/pelicula.formato";
import { ConceptoValidacion, ResultadoValidacion, UsoQr } from "../../modelos/validacion.model";

const ETIQUETAS_CONCEPTO: Record<ConceptoValidacion, string> = {
  entrada: "Ingreso",
  candy: "Candy",
};

@Component({
  selector: "app-historial-validaciones",
  styleUrl: "./historial-validaciones.scss",
  templateUrl: "./historial-validaciones.html",
})
export class HistorialValidaciones {
  readonly historial = input<UsoQr[]>([]);

  protected readonly formatearHoraFuncion = formatearHoraFuncion;

  protected etiquetaConcepto(concepto: ConceptoValidacion): string {
    return ETIQUETAS_CONCEPTO[concepto];
  }

  protected cantidad(resultado: ResultadoValidacion): number {
    return this.historial().filter((uso) => uso.resultado === resultado).length;
  }
}
