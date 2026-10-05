import { Component, input } from "@angular/core";
import { FuncionMapa } from "../../../../core/modelos/funcion.model";
import { formatearFechaFuncion, formatearHoraFuncion } from "../../../../core/helpers/pelicula.formato";
import { EntradaEmitida } from "../../modelos/confirmacion.model";

@Component({
  selector: "app-ticket-entrada",
  standalone: false,
  styleUrl: "./ticket-entrada.scss",
  templateUrl: "./ticket-entrada.html",
})
export class TicketEntrada {
  readonly funcion = input<FuncionMapa | null>(null);
  readonly entrada = input<EntradaEmitida | null>(null);

  protected readonly formatearFechaFuncion = formatearFechaFuncion;
  protected readonly formatearHoraFuncion = formatearHoraFuncion;

  protected formatearCodigo(codigo: string): string {
    return codigo.match(/.{1,4}/g)?.join(" ") ?? codigo;
  }
}
