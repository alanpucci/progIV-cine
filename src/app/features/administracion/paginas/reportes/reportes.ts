import { Component, OnInit, inject, signal } from "@angular/core";
import { CargaGlobalService } from "../../../../core/servicios/carga-global.service";
import { formatearPesos } from "../../../../core/helpers/movimiento.formato";
import { AtajoPeriodo, BarraGrafico, Reporte } from "../../modelos/reporte-administracion.model";
import { ReportesAdministracionService } from "../../servicios/reportes-administracion.service";
import { ExportacionReportesService } from "../../servicios/exportacion-reportes.service";
import { formatearDiaReporte, formatearPeriodo, periodoDesdeAtajo } from "../../helpers/periodo-reporte.helpers";
import { formatearInicioFuncionReporte } from "../../helpers/tablas-reporte.helpers";
import { mensajeDeError } from "../../helpers/errores-administracion";

type VistaReporte = "facturacion" | "entradas" | "candy";

const CANTIDAD_EN_GRAFICO = 5;

@Component({
  selector: "app-reportes",
  standalone: false,
  styleUrl: "./reportes.scss",
  templateUrl: "./reportes.html",
})
export class Reportes implements OnInit {
  private readonly reportesService = inject(ReportesAdministracionService);
  private readonly exportacion = inject(ExportacionReportesService);
  protected readonly cargaGlobal = inject(CargaGlobalService);

  protected readonly atajos: { valor: AtajoPeriodo; texto: string }[] = [
    { valor: "hoy", texto: "Hoy" },
    { valor: "semana", texto: "Esta semana" },
    { valor: "mes", texto: "Este mes" },
  ];

  protected readonly desde = signal("");
  protected readonly hasta = signal("");
  protected readonly atajo = signal<AtajoPeriodo | null>("mes");
  protected readonly vista = signal<VistaReporte>("facturacion");
  protected readonly reporte = signal<Reporte | null>(null);
  protected readonly error = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    await this.elegirAtajo("mes");
  }

  protected async elegirAtajo(atajo: AtajoPeriodo): Promise<void> {
    const periodo = periodoDesdeAtajo(atajo);
    this.desde.set(periodo.desde);
    this.hasta.set(periodo.hasta);
    this.atajo.set(atajo);
    await this.consultar();
  }

  protected async consultarRango(): Promise<void> {
    this.atajo.set(null);
    await this.consultar();
  }

  protected async exportar(formato: "pdf" | "excel"): Promise<void> {
    const reporte = this.reporte();
    if (!reporte) return;
    await this.ejecutar(
      () => (formato === "pdf" ? this.exportacion.descargarPdf(reporte) : this.exportacion.descargarExcel(reporte)),
      "No se pudo generar el archivo.",
    );
  }

  protected periodoTexto(reporte: Reporte): string {
    return formatearPeriodo(reporte.periodo);
  }

  protected pesos(monto: number): string {
    return formatearPesos(monto);
  }

  protected dia(fecha: string): string {
    return formatearDiaReporte(fecha);
  }

  protected inicioFuncion(inicio: string): string {
    return formatearInicioFuncionReporte(inicio);
  }

  protected barrasPeliculas(reporte: Reporte): BarraGrafico[] {
    return reporte.peliculas.slice(0, CANTIDAD_EN_GRAFICO).map((pelicula) => ({
      etiqueta: pelicula.nombre,
      valor: pelicula.entradas,
      detalle: `${pelicula.entradas} ${pelicula.entradas === 1 ? "entrada" : "entradas"} · ${pelicula.funciones} ${pelicula.funciones === 1 ? "función" : "funciones"}`,
    }));
  }

  protected barrasProductos(reporte: Reporte): BarraGrafico[] {
    return reporte.productos.slice(0, CANTIDAD_EN_GRAFICO).map((producto) => ({
      etiqueta: producto.nombre,
      valor: producto.unidades,
      detalle: `${producto.sueltos} sueltos · ${producto.enCombos} en combos`,
    }));
  }

  private async consultar(): Promise<void> {
    if (!this.desde() || !this.hasta()) {
      this.error.set("Elegí las dos fechas del período.");
      return;
    }
    if (this.desde() > this.hasta()) {
      this.error.set("La fecha de inicio no puede ser posterior a la de fin.");
      return;
    }
    await this.ejecutar(async () => {
      this.reporte.set(await this.reportesService.obtenerReporte({ desde: this.desde(), hasta: this.hasta() }));
    }, "No se pudo calcular el reporte.");
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
