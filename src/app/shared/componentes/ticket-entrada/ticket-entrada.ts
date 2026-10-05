import { Component, input } from "@angular/core";
import { EntradaImprimible, EstadoEntrada, FuncionEntrada } from "../../../core/modelos/entrada.model";
import { formatearFechaFuncion, formatearHoraFuncion } from "../../../core/helpers/pelicula.formato";
import { CodigoQr } from "../codigo-qr/codigo-qr";

const ETIQUETAS_ESTADO: Record<EstadoEntrada, string> = {
  emitida: "Emitida",
  validada: "Validada",
  cancelada: "Cancelada",
};

@Component({
  imports: [CodigoQr],
  selector: "app-ticket-entrada",
  styleUrl: "./ticket-entrada.scss",
  templateUrl: "./ticket-entrada.html",
})
export class TicketEntrada {
  readonly funcion = input<FuncionEntrada | null>(null);
  readonly entrada = input<EntradaImprimible | null>(null);
  readonly estado = input<EstadoEntrada>("emitida");

  protected readonly formatearFechaFuncion = formatearFechaFuncion;
  protected readonly formatearHoraFuncion = formatearHoraFuncion;

  protected etiquetaEstado(): string {
    return ETIQUETAS_ESTADO[this.estado()];
  }

  protected formatearCodigo(codigo: string): string {
    return codigo.match(/.{1,4}/g)?.join(" ") ?? codigo;
  }
}
