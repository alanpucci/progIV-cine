import { Component, OnInit, inject, signal } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { CargaGlobalService } from "../../../../core/servicios/carga-global.service";
import { EstadoVenta } from "../../../../core/modelos/compra.model";
import { creditoPorCancelacion } from "../../../../core/helpers/cancelacion.helpers";
import { formatearFechaMovimiento, formatearPesos } from "../../../../core/helpers/movimiento.formato";
import { formatearFechaFuncion, formatearHoraFuncion } from "../../../../core/helpers/pelicula.formato";
import { sinEspaciosVacios } from "../../../../shared/validadores/texto.validadores";
import { VentaAdministracion } from "../../modelos/venta-administracion.model";
import { VentasAdministracionService } from "../../servicios/ventas-administracion.service";
import { mensajeDeError } from "../../helpers/errores-administracion";

type VistaVentas = Exclude<EstadoVenta, "pendiente">;

@Component({
  selector: "app-listado-ventas",
  standalone: false,
  styleUrl: "./listado-ventas.scss",
  templateUrl: "./listado-ventas.html",
})
export class ListadoVentas implements OnInit {
  private readonly ventasService = inject(VentasAdministracionService);
  private readonly fb = inject(FormBuilder);
  protected readonly cargaGlobal = inject(CargaGlobalService);

  protected readonly ventas = signal<VentaAdministracion[]>([]);
  protected readonly vista = signal<VistaVentas>("pagada");
  protected readonly busqueda = signal("");
  protected readonly ventaACancelar = signal<string | null>(null);
  protected readonly intentoCancelar = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly motivo = this.fb.control("", [Validators.required, sinEspaciosVacios]);

  async ngOnInit(): Promise<void> {
    await this.ejecutar(() => this.cargar(), "No se pudo cargar el listado de ventas.");
  }

  protected cantidad(vista: VistaVentas): number {
    return this.ventas().filter((venta) => venta.estado === vista).length;
  }

  protected ventasVisibles(): VentaAdministracion[] {
    const texto = this.busqueda().trim().toLowerCase();
    return this.ventas().filter(
      (venta) =>
        venta.estado === this.vista() &&
        (!texto ||
          [venta.email, venta.cliente ?? "", venta.funcion?.peliculaNombre ?? "", this.numeroOperacion(venta)]
            .join(" ")
            .toLowerCase()
            .includes(texto)),
    );
  }

  protected buscar(evento: Event): void {
    this.busqueda.set((evento.target as HTMLInputElement).value);
  }

  protected cambiarVista(vista: VistaVentas): void {
    this.vista.set(vista);
    this.ventaACancelar.set(null);
  }

  protected numeroOperacion(venta: VentaAdministracion): string {
    return venta.id.slice(0, 8).toUpperCase();
  }

  protected fecha(fecha: string): string {
    return formatearFechaMovimiento(fecha);
  }

  protected funcionTexto(venta: VentaAdministracion): string {
    if (!venta.funcion) return "";
    const { inicio, salaNombre } = venta.funcion;
    return `${formatearFechaFuncion(inicio)} · ${formatearHoraFuncion(inicio)} · ${salaNombre}`;
  }

  protected extrasTexto(venta: VentaAdministracion): string {
    return venta.extras.map((extra) => `${extra.cantidad}× ${extra.nombre}`).join(", ");
  }

  protected total(venta: VentaAdministracion): string {
    return formatearPesos(venta.total);
  }

  protected avisoCancelacion(venta: VentaAdministracion): string {
    if (!venta.cliente) {
      return "Compra anónima: se liberan las butacas, pero no hay una cuenta donde acreditar crédito.";
    }
    const credito = formatearPesos(creditoPorCancelacion(venta.total, venta.puntosUsados));
    return `Se liberan las butacas, se acreditan ${credito} de crédito a ${venta.cliente} y se revierten los puntos de esta compra.`;
  }

  protected motivoInvalido(): boolean {
    return this.motivo.invalid && (this.motivo.touched || this.intentoCancelar());
  }

  protected pedirCancelacion(venta: VentaAdministracion): void {
    this.motivo.reset("");
    this.intentoCancelar.set(false);
    this.ventaACancelar.set(venta.id);
  }

  protected async confirmarCancelacion(venta: VentaAdministracion): Promise<void> {
    this.intentoCancelar.set(true);
    if (this.motivo.invalid) return;

    await this.ejecutar(async () => {
      await this.ventasService.cancelar(venta.id, (this.motivo.value ?? "").trim());
      this.ventaACancelar.set(null);
      await this.cargar();
    }, "No se pudo cancelar la venta.");
  }

  private async cargar(): Promise<void> {
    this.ventas.set(await this.ventasService.obtenerListado());
  }

  private async ejecutar(tarea: () => Promise<void>, mensajeGenerico: string): Promise<void> {
    this.error.set(null);
    try {
      await this.cargaGlobal.envolver(tarea);
    } catch (error) {
      this.error.set(mensajeDeError(error, mensajeGenerico));
    }
  }
}
