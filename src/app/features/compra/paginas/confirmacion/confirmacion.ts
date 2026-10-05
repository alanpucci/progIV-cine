import { Component, inject, signal } from "@angular/core";
import { formatearFechaMovimiento, formatearPesos, formatearPuntos } from "../../../../core/helpers/movimiento.formato";
import { formatearClasificacion } from "../../../../core/helpers/pelicula.formato";
import { CargaGlobalService } from "../../../../core/servicios/carga-global.service";
import { PdfEntradasService } from "../../../../core/servicios/pdf-entradas.service";
import { CarritoService } from "../../servicios/carrito.service";
import { CompraConfirmada } from "../../modelos/confirmacion.model";

@Component({
  selector: "app-confirmacion",
  standalone: false,
  styleUrl: "./confirmacion.scss",
  templateUrl: "./confirmacion.html",
})
export class Confirmacion {
  protected readonly carrito = inject(CarritoService);
  private readonly pdfEntradas = inject(PdfEntradasService);
  private readonly cargaGlobal = inject(CargaGlobalService);

  protected readonly errorPdf = signal<string | null>(null);

  protected readonly formatearPesos = formatearPesos;
  protected readonly formatearPuntos = formatearPuntos;
  protected readonly formatearFechaMovimiento = formatearFechaMovimiento;
  protected readonly formatearClasificacion = formatearClasificacion;

  protected numeroOperacion(ventaId: string): string {
    return ventaId.slice(0, 8).toUpperCase();
  }

  protected async descargarPdf(compra: CompraConfirmada): Promise<void> {
    this.errorPdf.set(null);
    try {
      await this.cargaGlobal.envolver(() => this.pdfEntradas.descargar(compra.funcion, compra.entradas));
    } catch {
      this.errorPdf.set("No se pudo generar el PDF. Intentá de nuevo.");
    }
  }
}
