import { Component, inject, signal } from "@angular/core";
import { AbstractControl, FormBuilder, FormControl, Validators } from "@angular/forms";
import { CargaGlobalService } from "../../../../core/servicios/carga-global.service";
import { formatearPesos, formatearPuntos } from "../../../../core/helpers/movimiento.formato";
import { formatearFechaFuncion, formatearHoraFuncion } from "../../../../core/helpers/pelicula.formato";
import { CarritoService } from "../../servicios/carrito.service";
import { VentasService } from "../../servicios/ventas.service";
import {
  PATRON_CVV,
  PATRON_NUMERO_TARJETA,
  PATRON_VENCIMIENTO,
  formatoNumeroTarjeta,
  formatoVencimiento,
  simularAutorizacion,
  vencimientoVigente,
} from "../../helpers/tarjeta.helpers";

@Component({
  selector: "app-pago",
  standalone: false,
  styleUrl: "./pago.scss",
  templateUrl: "./pago.html",
})
export class Pago {
  private readonly ventas = inject(VentasService);
  private readonly cargaGlobal = inject(CargaGlobalService);
  private readonly fb = inject(FormBuilder);
  protected readonly carrito = inject(CarritoService);

  protected readonly formatearPesos = formatearPesos;
  protected readonly formatearPuntos = formatearPuntos;
  protected readonly formatearFechaFuncion = formatearFechaFuncion;
  protected readonly formatearHoraFuncion = formatearHoraFuncion;

  protected readonly intentoEnviar = signal(false);
  protected readonly errorPago = signal<string | null>(null);
  protected readonly ventaConfirmada = signal<string | null>(null);

  protected readonly formulario = this.fb.group({
    titular: ["", Validators.required],
    numero: ["", [Validators.required, Validators.pattern(PATRON_NUMERO_TARJETA)]],
    vencimiento: ["", [Validators.required, Validators.pattern(PATRON_VENCIMIENTO), vencimientoVigente]],
    cvv: ["", [Validators.required, Validators.pattern(PATRON_CVV)]],
  });

  protected requiereTarjeta(): boolean {
    return this.carrito.totalAPagar() > 0;
  }

  protected mostrarError(control: AbstractControl): boolean {
    return control.invalid && (control.touched || this.intentoEnviar());
  }

  protected formatearNumero(evento: Event): void {
    this.formatearCampo(evento, this.formulario.controls.numero, formatoNumeroTarjeta);
  }

  protected formatearVencimiento(evento: Event): void {
    this.formatearCampo(evento, this.formulario.controls.vencimiento, formatoVencimiento);
  }

  protected async pagar(): Promise<void> {
    this.intentoEnviar.set(true);
    this.errorPago.set(null);

    let referenciaPago: string | null = null;
    if (this.requiereTarjeta()) {
      if (this.formulario.invalid) return;
      referenciaPago = simularAutorizacion(this.formulario.value.numero ?? "");
      if (!referenciaPago) {
        this.errorPago.set("El emisor rechazó la tarjeta. Probá con otra.");
        return;
      }
    }

    const solicitud = this.carrito.solicitudDeCompra(referenciaPago);
    if (!solicitud) return;

    try {
      const ventaId = await this.cargaGlobal.envolver(() => this.ventas.confirmarCompra(solicitud));
      this.carrito.vaciar();
      this.ventaConfirmada.set(ventaId);
    } catch (error) {
      this.errorPago.set((error as Error).message);
    }
  }

  private formatearCampo(
    evento: Event,
    control: FormControl<string | null>,
    formatear: (valor: string, insertando: boolean) => string,
  ): void {
    const entrada = evento as InputEvent;
    const valor = (entrada.target as HTMLInputElement).value;
    control.setValue(formatear(valor, entrada.inputType?.startsWith("insert") ?? false));
  }
}
