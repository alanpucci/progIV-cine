import { Component, OnInit, inject, input, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { CargaGlobalService } from "../../../../core/servicios/carga-global.service";
import { ComprasService } from "../../../../core/servicios/compras.service";
import { Compra, EstadoVenta } from "../../../../core/modelos/compra.model";
import { formatearFechaMovimiento, formatearPesos } from "../../../../core/helpers/movimiento.formato";
import { formatearFechaFuncion, formatearHoraFuncion } from "../../../../core/helpers/pelicula.formato";

const ETIQUETAS_ESTADO: Record<EstadoVenta, string> = {
  pendiente: "Pendiente",
  pagada: "Pagada",
  cancelada: "Cancelada",
};

@Component({
  imports: [RouterLink],
  selector: "app-historial-compras",
  styleUrl: "./historial-compras.scss",
  templateUrl: "./historial-compras.html",
})
export class HistorialCompras implements OnInit {
  private readonly compras = inject(ComprasService);
  private readonly cargaGlobal = inject(CargaGlobalService);

  readonly usuarioId = input("");

  protected readonly listado = signal<Compra[] | null>(null);
  protected readonly errorCarga = signal<string | null>(null);

  ngOnInit(): void {
    void this.cargar();
  }

  protected fechaCompra(compra: Compra): string {
    return formatearFechaMovimiento(compra.fecha);
  }

  protected funcionTexto(compra: Compra): string {
    if (!compra.funcion) return "";
    const { inicio, salaNombre } = compra.funcion;
    return `${formatearFechaFuncion(inicio)} · ${formatearHoraFuncion(inicio)} · ${salaNombre}`;
  }

  protected extrasTexto(compra: Compra): string {
    return compra.extras.map((extra) => `${extra.cantidad}× ${extra.nombre}`).join(", ");
  }

  protected total(compra: Compra): string {
    return formatearPesos(compra.total);
  }

  protected estado(compra: Compra): string {
    return ETIQUETAS_ESTADO[compra.estado];
  }

  private async cargar(): Promise<void> {
    const usuarioId = this.usuarioId();
    if (!usuarioId) return;
    try {
      const compras = await this.cargaGlobal.envolver(() => this.compras.obtenerComprasPropias(usuarioId));
      this.listado.set(compras);
    } catch {
      this.errorCarga.set("No se pudo cargar tu historial de compras.");
    }
  }
}
