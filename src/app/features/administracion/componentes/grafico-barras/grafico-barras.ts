import { Component, input } from "@angular/core";
import { BarraGrafico } from "../../modelos/reporte-administracion.model";

@Component({
  selector: "app-grafico-barras",
  standalone: false,
  styleUrl: "./grafico-barras.scss",
  templateUrl: "./grafico-barras.html",
})
export class GraficoBarras {
  readonly titulo = input("");
  readonly subtitulo = input("");
  readonly barras = input<BarraGrafico[]>([]);
  readonly mensajeVacio = input("Sin datos en el período.");

  protected largo(barra: BarraGrafico): number {
    const maximo = Math.max(...this.barras().map((actual) => actual.valor));
    return maximo > 0 ? (barra.valor / maximo) * 100 : 0;
  }
}
