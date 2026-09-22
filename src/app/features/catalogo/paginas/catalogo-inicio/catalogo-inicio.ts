import { Component, inject, signal } from "@angular/core";
import { PeliculasService } from "../../../../core/servicios/peliculas.service";
import { CargaGlobalService } from "../../../../core/servicios/carga-global.service";
import { PeliculaResumen } from "../../../../core/modelos/pelicula.model";
import { formatearClasificacion, formatearDuracion } from "../../../../core/helpers/pelicula.formato";
import { Tarjeta } from "../../../../shared/componentes/tarjeta/tarjeta";

@Component({
  imports: [Tarjeta],
  selector: "app-catalogo-inicio",
  styleUrl: "./catalogo-inicio.scss",
  templateUrl: "./catalogo-inicio.html",
})
export class CatalogoInicio {
  private readonly peliculasService = inject(PeliculasService);
  private readonly cargaGlobal = inject(CargaGlobalService);

  protected readonly destacadas = signal<PeliculaResumen[]>([]);
  protected readonly cargandoDestacadas = signal(true);
  protected readonly errorDestacadas = signal(false);

  protected readonly listado = signal<PeliculaResumen[]>([]);
  protected readonly cargandoListado = signal(true);
  protected readonly errorListado = signal(false);

  protected readonly formatearDuracion = formatearDuracion;
  protected readonly formatearClasificacion = formatearClasificacion;

  constructor() {
    this.cargarDestacadas();
    this.cargarListado();
  }

  private async cargarDestacadas(): Promise<void> {
    try {
      const resultado = await this.cargaGlobal.envolver(() => this.peliculasService.obtenerDestacadas());
      this.destacadas.set(resultado);
    } catch {
      this.errorDestacadas.set(true);
    } finally {
      this.cargandoDestacadas.set(false);
    }
  }

  private async cargarListado(): Promise<void> {
    try {
      const resultado = await this.cargaGlobal.envolver(() => this.peliculasService.obtenerListado());
      this.listado.set(resultado);
    } catch {
      this.errorListado.set(true);
    } finally {
      this.cargandoListado.set(false);
    }
  }
}
