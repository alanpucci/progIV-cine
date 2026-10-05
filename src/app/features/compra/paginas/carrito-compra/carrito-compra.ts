import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import { CarritoService } from "../../servicios/carrito.service";
import { ExtraCarrito } from "../../modelos/carrito.model";
import { formatearFechaFuncion, formatearHoraFuncion } from "../../../../core/helpers/pelicula.formato";

@Component({
  selector: "app-carrito-compra",
  standalone: false,
  styleUrl: "./carrito-compra.scss",
  templateUrl: "./carrito-compra.html",
})
export class CarritoCompra {
  private readonly router = inject(Router);
  protected readonly carrito = inject(CarritoService);
  protected readonly formatearFechaFuncion = formatearFechaFuncion;
  protected readonly formatearHoraFuncion = formatearHoraFuncion;

  protected sumar(extra: ExtraCarrito): void {
    this.carrito.cambiarCantidad(extra.tipo, extra.id, extra.cantidad + 1);
  }

  protected restar(extra: ExtraCarrito): void {
    this.carrito.cambiarCantidad(extra.tipo, extra.id, extra.cantidad - 1);
  }

  protected continuar(): void {
    if (this.carrito.entradas().length === 0) return;
    this.router.navigate(["/compra/datos-comprador"]);
  }

  protected vaciarCarrito(): void {
    this.carrito.vaciar();
    this.router.navigate(["/"]);
  }
}
