import { Component, inject, signal } from "@angular/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { FuncionesService } from "../../../../core/servicios/funciones.service";
import { CargaGlobalService } from "../../../../core/servicios/carga-global.service";
import { SeleccionButacasService } from "../../../../core/servicios/seleccion-butacas.service";
import { Boton } from "../../../../shared/componentes/boton/boton";
import { ButacaSeleccionada } from "../../directivas/butaca-seleccionada.directive";
import { Butaca, FuncionMapa } from "../../../../core/modelos/funcion.model";

interface FilaDeButacas {
  fila: string;
  butacas: Butaca[];
}

@Component({
  imports: [RouterLink, Boton, ButacaSeleccionada],
  selector: "app-butacas-inicio",
  styleUrl: "./butacas-inicio.scss",
  templateUrl: "./butacas-inicio.html",
})
export class ButacasInicio {
  private readonly ruta = inject(ActivatedRoute);
  private readonly funcionesService = inject(FuncionesService);
  private readonly cargaGlobal = inject(CargaGlobalService);
  private readonly router = inject(Router);
  private readonly seleccionButacas = inject(SeleccionButacasService);

  protected readonly funcion = signal<FuncionMapa | null>(null);
  protected readonly butacas = signal<Butaca[]>([]);
  protected readonly cargando = signal(true);
  protected readonly error = signal(false);
  protected readonly idsSeleccionados = signal<string[]>([]);

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

  protected estaSeleccionada(butacaId: string): boolean {
    return this.idsSeleccionados().includes(butacaId);
  }

  protected alternarButaca(butacaId: string): void {
    this.idsSeleccionados.update((ids) =>
      ids.includes(butacaId) ? ids.filter((id) => id !== butacaId) : [...ids, butacaId],
    );
  }

  protected butacasSeleccionadas(): Butaca[] {
    const ids = this.idsSeleccionados();
    return this.butacas().filter((butaca) => ids.includes(butaca.id));
  }

  protected totalSeleccion(): number {
    const precioBase = Number(this.funcion()?.precioBase ?? 0);
    return this.butacasSeleccionadas().reduce(
      (suma, butaca) => suma + precioBase + Number(butaca.precioAdicional),
      0,
    );
  }

  protected confirmarSeleccion(): void {
    const funcion = this.funcion();
    const butacas = this.butacasSeleccionadas();
    if (!funcion || butacas.length === 0) return;
    this.seleccionButacas.confirmar(funcion, butacas);
    this.router.navigate(["/butacas/funcion", funcion.id, "resumen"]);
  }

  private async cargarMapa(funcionId: string): Promise<void> {
    this.cargando.set(true);
    this.error.set(false);
    this.funcion.set(null);
    this.butacas.set([]);
    this.idsSeleccionados.set([]);
    try {
      const funcion = await this.cargaGlobal.envolver(() => this.funcionesService.obtenerParaMapa(funcionId));
      this.funcion.set(funcion);
      if (!funcion) return;
      const butacas = await this.cargaGlobal.envolver(() =>
        this.funcionesService.obtenerButacasPorSala(funcion.salaId),
      );
      this.butacas.set(butacas);
      const idsDisponibles = butacas.map((butaca) => butaca.id);
      this.idsSeleccionados.set(
        this.seleccionButacas.idsElegidosPara(funcionId).filter((id) => idsDisponibles.includes(id)),
      );
    } catch {
      this.error.set(true);
    } finally {
      this.cargando.set(false);
    }
  }
}
