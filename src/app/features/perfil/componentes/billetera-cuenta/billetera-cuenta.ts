import { Component, OnInit, inject, input, signal } from "@angular/core";
import { CargaGlobalService } from "../../../../core/servicios/carga-global.service";
import { MovimientosService } from "../../../../core/servicios/movimientos.service";
import { MovimientoCredito, MovimientoPuntos, SaldosCuenta } from "../../../../core/modelos/movimiento.model";
import {
  ETIQUETAS_MOVIMIENTO_CREDITO,
  ETIQUETAS_MOVIMIENTO_PUNTOS,
  formatearFechaMovimiento,
  formatearPesos,
  formatearPuntos,
} from "../../../../core/helpers/movimiento.formato";

type PestanaBilletera = "puntos" | "credito";

interface FilaHistorial {
  id: string;
  concepto: string;
  fecha: string;
  cantidad: string;
  positivo: boolean;
}

@Component({
  imports: [],
  selector: "app-billetera-cuenta",
  styleUrl: "./billetera-cuenta.scss",
  templateUrl: "./billetera-cuenta.html",
})
export class BilleteraCuenta implements OnInit {
  private readonly movimientos = inject(MovimientosService);
  private readonly cargaGlobal = inject(CargaGlobalService);

  readonly usuarioId = input("");

  protected readonly saldos = signal<SaldosCuenta | null>(null);
  protected readonly movimientosPuntos = signal<MovimientoPuntos[]>([]);
  protected readonly movimientosCredito = signal<MovimientoCredito[]>([]);
  protected readonly pestana = signal<PestanaBilletera>("puntos");
  protected readonly errorCarga = signal<string | null>(null);

  ngOnInit(): void {
    void this.cargar();
  }

  protected puntosSaldo(): string {
    return formatearPuntos(this.saldos()?.puntos ?? 0);
  }

  protected creditoSaldo(): string {
    return formatearPesos(this.saldos()?.credito ?? 0);
  }

  protected elegirPestana(pestana: PestanaBilletera): void {
    this.pestana.set(pestana);
  }

  protected filas(): FilaHistorial[] {
    if (this.pestana() === "puntos") {
      return this.movimientosPuntos().map((movimiento) => ({
        id: movimiento.id,
        concepto: ETIQUETAS_MOVIMIENTO_PUNTOS[movimiento.tipo],
        fecha: formatearFechaMovimiento(movimiento.fecha),
        cantidad: `${movimiento.cantidad > 0 ? "+" : ""}${formatearPuntos(movimiento.cantidad)} pts`,
        positivo: movimiento.cantidad > 0,
      }));
    }
    return this.movimientosCredito().map((movimiento) => ({
      id: movimiento.id,
      concepto: ETIQUETAS_MOVIMIENTO_CREDITO[movimiento.tipo],
      fecha: formatearFechaMovimiento(movimiento.fecha),
      cantidad: `${movimiento.cantidad > 0 ? "+" : ""}${formatearPesos(movimiento.cantidad)}`,
      positivo: movimiento.cantidad > 0,
    }));
  }

  private async cargar(): Promise<void> {
    const usuarioId = this.usuarioId();
    if (!usuarioId) return;
    try {
      const [saldos, puntos, credito] = await this.cargaGlobal.envolver(() =>
        Promise.all([
          this.movimientos.obtenerSaldos(usuarioId),
          this.movimientos.obtenerMovimientosPuntos(usuarioId),
          this.movimientos.obtenerMovimientosCredito(usuarioId),
        ]),
      );
      this.saldos.set(saldos);
      this.movimientosPuntos.set(puntos);
      this.movimientosCredito.set(credito);
    } catch {
      this.errorCarga.set("No se pudieron cargar tus saldos y movimientos.");
    }
  }
}
