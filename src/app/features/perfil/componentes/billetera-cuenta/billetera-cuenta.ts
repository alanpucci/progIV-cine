import { Component, OnInit, inject, input, signal } from "@angular/core";
import { CargaGlobalService } from "../../../../core/servicios/carga-global.service";
import { MovimientosService } from "../../../../core/servicios/movimientos.service";
import { RecompensasService } from "../../../../core/servicios/recompensas.service";
import { MovimientoCredito, MovimientoPuntos, SaldosCuenta } from "../../../../core/modelos/movimiento.model";
import { Recompensa } from "../../../../core/modelos/recompensa.model";
import {
  ETIQUETAS_MOVIMIENTO_CREDITO,
  ETIQUETAS_MOVIMIENTO_PUNTOS,
  formatearFechaMovimiento,
  formatearPesos,
  formatearPuntos,
} from "../../../../core/helpers/movimiento.formato";

type Moneda = "puntos" | "credito";
type FiltroBilletera = Moneda | "todos";

interface FilaHistorial {
  id: string;
  moneda: Moneda;
  concepto: string;
  fecha: string;
  fechaIso: string;
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
  private readonly recompensasService = inject(RecompensasService);
  private readonly cargaGlobal = inject(CargaGlobalService);

  readonly usuarioId = input("");

  protected readonly formatearPuntos = formatearPuntos;
  protected readonly saldos = signal<SaldosCuenta | null>(null);
  protected readonly movimientosPuntos = signal<MovimientoPuntos[]>([]);
  protected readonly movimientosCredito = signal<MovimientoCredito[]>([]);
  protected readonly recompensas = signal<Recompensa[]>([]);
  protected readonly filtro = signal<FiltroBilletera>("todos");
  protected readonly errorCarga = signal<string | null>(null);

  ngOnInit(): void {
    void this.cargar();
  }

  recargar(): void {
    void this.cargar();
  }

  protected puntosSaldo(): string {
    return formatearPuntos(this.saldos()?.puntos ?? 0);
  }

  protected creditoSaldo(): string {
    return formatearPesos(this.saldos()?.credito ?? 0);
  }

  protected alternarFiltro(moneda: Moneda): void {
    this.filtro.set(this.filtro() === moneda ? "todos" : moneda);
  }

  protected tituloHistorial(): string {
    if (this.filtro() === "puntos") return "Movimientos de puntos";
    if (this.filtro() === "credito") return "Movimientos de crédito";
    return "Todos los movimientos";
  }

  protected puntosFaltantes(recompensa: Recompensa): number {
    return Math.max(recompensa.puntosCosto - (this.saldos()?.puntos ?? 0), 0);
  }

  protected filas(): FilaHistorial[] {
    const filas: FilaHistorial[] = [];
    if (this.filtro() !== "credito") {
      filas.push(
        ...this.movimientosPuntos().map((movimiento) => ({
          id: movimiento.id,
          moneda: "puntos" as const,
          concepto: movimiento.canje ? `Canje: ${movimiento.canje}` : ETIQUETAS_MOVIMIENTO_PUNTOS[movimiento.tipo],
          fecha: formatearFechaMovimiento(movimiento.fecha),
          fechaIso: movimiento.fecha,
          cantidad: `${movimiento.cantidad > 0 ? "+" : ""}${formatearPuntos(movimiento.cantidad)} pts`,
          positivo: movimiento.cantidad > 0,
        })),
      );
    }
    if (this.filtro() !== "puntos") {
      filas.push(
        ...this.movimientosCredito().map((movimiento) => ({
          id: movimiento.id,
          moneda: "credito" as const,
          concepto: ETIQUETAS_MOVIMIENTO_CREDITO[movimiento.tipo],
          fecha: formatearFechaMovimiento(movimiento.fecha),
          fechaIso: movimiento.fecha,
          cantidad: `${movimiento.cantidad > 0 ? "+" : ""}${formatearPesos(movimiento.cantidad)}`,
          positivo: movimiento.cantidad > 0,
        })),
      );
    }
    return filas.sort((a, b) => b.fechaIso.localeCompare(a.fechaIso));
  }

  private async cargar(): Promise<void> {
    const usuarioId = this.usuarioId();
    if (!usuarioId) return;
    try {
      const [saldos, puntos, credito, recompensas] = await this.cargaGlobal.envolver(() =>
        Promise.all([
          this.movimientos.obtenerSaldos(usuarioId),
          this.movimientos.obtenerMovimientosPuntos(usuarioId),
          this.movimientos.obtenerMovimientosCredito(usuarioId),
          this.recompensasService.obtenerDisponibles(),
        ]),
      );
      this.saldos.set(saldos);
      this.movimientosPuntos.set(puntos);
      this.movimientosCredito.set(credito);
      this.recompensas.set(recompensas);
    } catch {
      this.errorCarga.set("No se pudieron cargar tus saldos y movimientos.");
    }
  }
}
