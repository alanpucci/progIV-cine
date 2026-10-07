import { Component, OnInit, inject, input, output, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { CargaGlobalService } from "../../../../core/servicios/carga-global.service";
import { ComprasService } from "../../../../core/servicios/compras.service";
import { Compra, EstadoVenta } from "../../../../core/modelos/compra.model";
import { formatearFechaMovimiento, formatearPesos } from "../../../../core/helpers/movimiento.formato";
import { formatearFechaFuncion, formatearHoraFuncion } from "../../../../core/helpers/pelicula.formato";
import {
  HORAS_LIMITE_CANCELACION,
  creditoPorCancelacion,
  dentroDelPlazoDeCancelacion,
} from "../../../../core/helpers/cancelacion.helpers";
import { Boton } from "../../../../shared/componentes/boton/boton";

const ETIQUETAS_ESTADO: Record<EstadoVenta, string> = {
  pendiente: "Pendiente",
  pagada: "Pagada",
  cancelada: "Cancelada",
};

@Component({
  imports: [RouterLink, Boton],
  selector: "app-historial-compras",
  styleUrl: "./historial-compras.scss",
  templateUrl: "./historial-compras.html",
})
export class HistorialCompras implements OnInit {
  private readonly compras = inject(ComprasService);
  private readonly cargaGlobal = inject(CargaGlobalService);

  readonly usuarioId = input("");
  readonly compraCancelada = output<void>();

  protected readonly horasLimite = HORAS_LIMITE_CANCELACION;
  protected readonly listado = signal<Compra[] | null>(null);
  protected readonly errorCarga = signal<string | null>(null);
  protected readonly compraACancelar = signal<string | null>(null);
  protected readonly errorCancelacion = signal<string | null>(null);
  protected readonly compraRecienCancelada = signal<string | null>(null);

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

  protected cancelable(compra: Compra): boolean {
    return compra.estado === "pagada" && compra.funcion !== null && dentroDelPlazoDeCancelacion(compra.funcion.inicio);
  }

  protected creditoCancelacion(compra: Compra): string {
    return formatearPesos(creditoPorCancelacion(compra.total, compra.puntosUsados));
  }

  protected pedirConfirmacion(compra: Compra): void {
    this.errorCancelacion.set(null);
    this.compraRecienCancelada.set(null);
    this.compraACancelar.set(compra.id);
  }

  protected async confirmarCancelacion(compra: Compra): Promise<void> {
    this.errorCancelacion.set(null);
    if (!this.cancelable(compra)) {
      this.compraACancelar.set(null);
      this.errorCancelacion.set(
        `Esta compra ya no se puede cancelar: el plazo vence ${HORAS_LIMITE_CANCELACION} horas antes de la función.`,
      );
      return;
    }
    try {
      await this.cargaGlobal.envolver(() => this.compras.cancelarCompra(compra.id));
      this.listado.update((compras) =>
        (compras ?? []).map((actual) => (actual.id === compra.id ? { ...actual, estado: "cancelada" } : actual)),
      );
      this.compraACancelar.set(null);
      this.compraRecienCancelada.set(compra.id);
      this.compraCancelada.emit();
    } catch {
      this.errorCancelacion.set("No se pudo cancelar la compra. Intentá de nuevo.");
    }
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
