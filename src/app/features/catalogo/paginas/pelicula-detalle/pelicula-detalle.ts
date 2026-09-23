import { Component, inject, OnDestroy, signal } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { Subscription } from "rxjs";
import { PeliculasService } from "../../../../core/servicios/peliculas.service";
import { CargaGlobalService } from "../../../../core/servicios/carga-global.service";
import { FuncionDisponible, PeliculaDetalle } from "../../../../core/modelos/pelicula.model";
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
  imports: [RouterLink],
  selector: "app-pelicula-detalle",
  styleUrl: "./pelicula-detalle.scss",
  templateUrl: "./pelicula-detalle.html",
})
export class PeliculaDetallePagina implements OnDestroy {
  private readonly ruta = inject(ActivatedRoute);
  private readonly peliculasService = inject(PeliculasService);
  private readonly cargaGlobal = inject(CargaGlobalService);
  private readonly suscripcionRuta: Subscription;

  protected readonly detalle = signal<PeliculaDetalle | null>(null);
  protected readonly cargando = signal(true);
  protected readonly error = signal(false);

  protected readonly rangoEstrellas = [1, 2, 3, 4, 5] as const;

  protected readonly formatearDuracion = formatearDuracion;
  protected readonly formatearClasificacion = formatearClasificacion;
  protected readonly formatearFechaEstreno = formatearFechaEstreno;
  protected readonly formatearHoraFuncion = formatearHoraFuncion;

  constructor() {
    this.suscripcionRuta = this.ruta.paramMap.subscribe((params) => {
      this.cargarDetalle(params.get("id")!);
    });
  }

  ngOnDestroy(): void {
    this.suscripcionRuta.unsubscribe();
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

  private async cargarDetalle(id: string): Promise<void> {
    this.cargando.set(true);
    this.error.set(false);
    this.detalle.set(null);
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
