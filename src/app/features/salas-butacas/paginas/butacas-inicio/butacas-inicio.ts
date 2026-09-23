import { Component, inject, signal } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { FuncionesService } from "../../../../core/servicios/funciones.service";
import { CargaGlobalService } from "../../../../core/servicios/carga-global.service";
import { Butaca, FuncionMapa } from "../../../../core/modelos/funcion.model";
import { formatearFechaFuncion, formatearHoraFuncion } from "../../../../core/helpers/pelicula.formato";

interface FilaDeButacas {
  fila: string;
  butacas: Butaca[];
}

@Component({
  imports: [RouterLink],
  selector: "app-butacas-inicio",
  styleUrl: "./butacas-inicio.scss",
  templateUrl: "./butacas-inicio.html",
})
export class ButacasInicio {
  private readonly ruta = inject(ActivatedRoute);
  private readonly funcionesService = inject(FuncionesService);
  private readonly cargaGlobal = inject(CargaGlobalService);

  protected readonly funcion = signal<FuncionMapa | null>(null);
  protected readonly butacas = signal<Butaca[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal(false);

  protected readonly formatearFechaFuncion = formatearFechaFuncion;
  protected readonly formatearHoraFuncion = formatearHoraFuncion;

  constructor() {
    this.cargarMapa(this.ruta.snapshot.paramMap.get("id")!);
  }

  protected filasDeButacas(): FilaDeButacas[] {
    const grupos = new Map<string, Butaca[]>();
    for (const butaca of this.butacas()) {
      const lista = grupos.get(butaca.fila) ?? [];
      lista.push(butaca);
      grupos.set(butaca.fila, lista);
    }
    const filas = [...grupos.keys()].sort((filaA, filaB) => filaA.localeCompare(filaB, "es"));
    if (filas.length === 0) return [];

    const codigoDesde = filas[0].charCodeAt(0);
    const codigoHasta = filas[filas.length - 1].charCodeAt(0);
    const resultado: FilaDeButacas[] = [];
    for (let codigo = codigoDesde; codigo <= codigoHasta; codigo++) {
      const fila = String.fromCharCode(codigo);
      resultado.push({ fila, butacas: grupos.get(fila) ?? [] });
    }
    return resultado;
  }

  protected columnasSala(): number {
    return this.butacas().reduce((maximo, butaca) => Math.max(maximo, butaca.numero), 0);
  }

  private async cargarMapa(funcionId: string): Promise<void> {
    this.cargando.set(true);
    this.error.set(false);
    this.funcion.set(null);
    this.butacas.set([]);
    try {
      const funcion = await this.cargaGlobal.envolver(() => this.funcionesService.obtenerParaMapa(funcionId));
      this.funcion.set(funcion);
      if (!funcion) return;
      const butacas = await this.cargaGlobal.envolver(() =>
        this.funcionesService.obtenerButacasPorSala(funcion.salaId),
      );
      this.butacas.set(butacas);
    } catch {
      this.error.set(true);
    } finally {
      this.cargando.set(false);
    }
  }
}
