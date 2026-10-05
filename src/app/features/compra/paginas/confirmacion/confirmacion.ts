import { Component, inject } from "@angular/core";
import { formatearFechaMovimiento, formatearPesos, formatearPuntos } from "../../../../core/helpers/movimiento.formato";
import { formatearClasificacion } from "../../../../core/helpers/pelicula.formato";
import { CarritoService } from "../../servicios/carrito.service";

@Component({
  selector: "app-confirmacion",
  standalone: false,
  styleUrl: "./confirmacion.scss",
  templateUrl: "./confirmacion.html",
})
export class Confirmacion {
  protected readonly carrito = inject(CarritoService);

  protected readonly formatearPesos = formatearPesos;
  protected readonly formatearPuntos = formatearPuntos;
  protected readonly formatearFechaMovimiento = formatearFechaMovimiento;
  protected readonly formatearClasificacion = formatearClasificacion;

  protected numeroOperacion(ventaId: string): string {
    return ventaId.slice(0, 8).toUpperCase();
  }
}
