import { Component, inject, signal } from "@angular/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { Boton } from "../../../../shared/componentes/boton/boton";
import { PeliculasService } from "../../../../core/servicios/peliculas.service";
import { CargaGlobalService } from "../../../../core/servicios/carga-global.service";
import { PeliculaDetalle } from "../../../../core/modelos/pelicula.model";
import { FuncionDisponible } from "../../../../core/modelos/funcion.model";
import {
  formatearClasificacion,
  formatearDuracion,
  formatearFechaEstreno,
  formatearFechaFuncion,
  formatearHoraFuncion,
} from "../../../../core/helpers/pelicula.formato";

interface GrupoFunciones {
  fecha: string;
  funciones: FuncionDisponible[];
}

@Component({
  imports: [RouterLink, Boton],
  selector: "app-pelicula-detalle",
  styleUrl: "./pelicula-detalle.scss",
  templateUrl: "./pelicula-detalle.html",
})
export class PeliculaDetallePagina {
  private readonly ruta = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly peliculasService = inject(PeliculasService);
  private readonly cargaGlobal = inject(CargaGlobalService);

  protected readonly detalle = signal<PeliculaDetalle | null>(null);
  protected readonly cargando = signal(true);
  protected readonly error = signal(false);
  protected readonly funcionSeleccionada = signal<string | null>(null);

  protected readonly rangoEstrellas = [1, 2, 3, 4, 5] as const;

  protected readonly formatearDuracion = formatearDuracion;
  protected readonly formatearClasificacion = formatearClasificacion;
  protected readonly formatearFechaEstreno = formatearFechaEstreno;
  protected readonly formatearHoraFuncion = formatearHoraFuncion;

  constructor() {
    this.cargarDetalle(this.ruta.snapshot.paramMap.get("id")!);
  }

  protected funcionesAgrupadas(): GrupoFunciones[] {
    const grupos = new Map<string, FuncionDisponible[]>();
    for (const funcion of this.detalle()?.funciones ?? []) {
      const fecha = formatearFechaFuncion(funcion.inicio);
      const lista = grupos.get(fecha) ?? [];
      lista.push(funcion);
      grupos.set(fecha, lista);
    }
    return [...grupos.entries()].map(([fecha, funciones]) => ({ fecha, funciones }));
  }

  protected promedioRedondeado(): number {
    const promedio = this.detalle()?.promedioEstrellas;
    return promedio ? Math.round(promedio) : 0;
  }

  protected seleccionarFuncion(id: string): void {
    this.funcionSeleccionada.set(id);
  }

  protected continuarAButacas(): void {
    const id = this.funcionSeleccionada();
    if (!id) return;
    this.router.navigate(["/butacas/funcion", id]);
  }

  private async cargarDetalle(id: string): Promise<void> {
    this.cargando.set(true);
    this.error.set(false);
    this.detalle.set(null);
    this.funcionSeleccionada.set(null);
    try {
      const resultado = await this.cargaGlobal.envolver(() => this.peliculasService.obtenerDetalle(id));
      this.detalle.set(resultado);
    } catch {
      this.error.set(true);
    } finally {
      this.cargando.set(false);
    }
  }
}
