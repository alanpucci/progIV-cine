import { Component, OnInit, inject, input, signal } from "@angular/core";
import { Recompensa } from "../../../../core/modelos/recompensa.model";
import { RecompensasService } from "../../../../core/servicios/recompensas.service";
import { formatearPuntos } from "../../../../core/helpers/movimiento.formato";
import { CarritoService } from "../../servicios/carrito.service";

@Component({
  selector: "app-recompensas-compra",
  standalone: false,
  styleUrl: "./recompensas-compra.scss",
  templateUrl: "./recompensas-compra.html",
})
export class RecompensasCompra implements OnInit {
  private readonly recompensasService = inject(RecompensasService);
  protected readonly carrito = inject(CarritoService);

  readonly puntosSaldo = input(0);

  protected readonly formatearPuntos = formatearPuntos;
  protected readonly recompensas = signal<Recompensa[]>([]);
  protected readonly error = signal("");

  async ngOnInit(): Promise<void> {
    try {
      this.recompensas.set(await this.recompensasService.obtenerDisponibles());
    } catch {
      this.error.set("No se pudieron cargar las recompensas.");
    }
  }

  protected puntosLibres(): number {
    return this.puntosSaldo() - this.carrito.puntosCanjes() - this.carrito.puntosUsados();
  }

  protected motivoBloqueo(recompensa: Recompensa): string {
    if (recompensa.tipo === "entrada" && this.carrito.entradasCanjeadas().length >= this.carrito.entradas().length) {
      return "Ya cubriste todas tus entradas";
    }
    const faltan = recompensa.puntosCosto - this.puntosLibres();
    return faltan > 0 ? `Te faltan ${formatearPuntos(faltan)} pts` : "";
  }

  protected canjear(recompensa: Recompensa): void {
    if (this.motivoBloqueo(recompensa)) return;
    this.carrito.canjear(recompensa);
  }

  protected detalle(recompensa: Recompensa): string {
    return recompensa.tipo === "entrada" ? "Cubre una entrada" : "Se suma a tu pedido del Candy Bar";
  }
}
