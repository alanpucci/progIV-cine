import { Component, OnInit, inject, input, signal } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { CargaGlobalService } from "../../../../core/servicios/carga-global.service";
import { MovimientosService } from "../../../../core/servicios/movimientos.service";
import { SaldosCuenta } from "../../../../core/modelos/movimiento.model";
import { formatearPesos, formatearPuntos } from "../../../../core/helpers/movimiento.formato";
import { CarritoService } from "../../servicios/carrito.service";
import { VALOR_PUNTO_EN_PESOS } from "../../modelos/carrito.model";

@Component({
  selector: "app-saldos-compra",
  standalone: false,
  styleUrl: "./saldos-compra.scss",
  templateUrl: "./saldos-compra.html",
})
export class SaldosCompra implements OnInit {
  private readonly movimientos = inject(MovimientosService);
  private readonly cargaGlobal = inject(CargaGlobalService);
  private readonly fb = inject(FormBuilder);
  protected readonly carrito = inject(CarritoService);

  readonly usuarioId = input("");

  protected readonly valorPunto = VALOR_PUNTO_EN_PESOS;
  protected readonly formatearPesos = formatearPesos;
  protected readonly formatearPuntos = formatearPuntos;

  protected readonly saldos = signal<SaldosCuenta | null>(null);
  protected readonly error = signal("");

  protected readonly formulario = this.fb.group({
    credito: [0],
    puntos: [0],
  });

  async ngOnInit(): Promise<void> {
    const usuarioId = this.usuarioId();
    if (!usuarioId) return;
    try {
      this.saldos.set(await this.cargaGlobal.envolver(() => this.movimientos.obtenerSaldos(usuarioId)));
      this.formulario.setValue({ credito: this.carrito.creditoUsado(), puntos: this.carrito.puntosUsados() });
    } catch {
      this.error.set("No se pudo consultar el saldo de tu cuenta.");
    }
  }

  protected tieneSaldo(): boolean {
    const saldos = this.saldos();
    return saldos !== null && (saldos.credito > 0 || saldos.puntos > 0);
  }

  protected puntosParaPago(saldos: SaldosCuenta): number {
    return saldos.puntos - this.carrito.puntosCanjes();
  }

  protected aplicar(): void {
    this.error.set("");
    const saldos = this.saldos();
    if (!saldos) return;

    const credito = Number(this.formulario.value.credito) || 0;
    const puntos = Number(this.formulario.value.puntos) || 0;
    const mensaje = this.validar(saldos, credito, puntos);
    if (mensaje) {
      this.error.set(mensaje);
      return;
    }
    this.carrito.aplicarSaldos({ credito, puntos });
  }

  protected usarTodo(): void {
    const saldos = this.saldos();
    if (!saldos) return;
    const credito = Math.min(saldos.credito, this.carrito.total());
    const puntos = Math.min(this.puntosParaPago(saldos), Math.floor((this.carrito.total() - credito) / VALOR_PUNTO_EN_PESOS));
    this.formulario.setValue({ credito, puntos });
    this.aplicar();
  }

  protected quitar(): void {
    this.error.set("");
    this.formulario.setValue({ credito: 0, puntos: 0 });
    this.carrito.aplicarSaldos(null);
  }

  private validar(saldos: SaldosCuenta, credito: number, puntos: number): string {
    if (credito < 0 || puntos < 0) return "Los montos no pueden ser negativos.";
    if (!Number.isInteger(puntos)) return "Los puntos se usan en unidades enteras.";
    if (credito > saldos.credito) return `Tu crédito disponible es de ${formatearPesos(saldos.credito)}.`;
    if (puntos > this.puntosParaPago(saldos)) {
      return `Tenés ${formatearPuntos(this.puntosParaPago(saldos))} puntos disponibles fuera de tus canjes.`;
    }
    if (credito + puntos * VALOR_PUNTO_EN_PESOS > this.carrito.total()) {
      return "El saldo aplicado supera el total de la compra.";
    }
    return "";
  }
}
