import { Component, inject, signal } from "@angular/core";
import { PeliculasService } from "../../../../core/servicios/peliculas.service";
import { CargaGlobalService } from "../../../../core/servicios/carga-global.service";
import { Genero, PeliculaResumen } from "../../../../core/modelos/pelicula.model";
import { formatearClasificacion, formatearDuracion } from "../../../../core/helpers/pelicula.formato";
import { normalizarTexto } from "../../../../core/helpers/texto.helpers";
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

  protected readonly terminoBusqueda = signal("");
  protected readonly generosSeleccionados = signal<ReadonlySet<string>>(new Set());

  protected generosDisponibles(): Genero[] {
    const mapa = new Map<string, Genero>();
    for (const pelicula of this.listado()) {
      for (const genero of pelicula.generos) {
        mapa.set(genero.id, genero);
      }
    }
    return [...mapa.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  }

  protected listadoFiltrado(): PeliculaResumen[] {
    const termino = normalizarTexto(this.terminoBusqueda());
    const generos = this.generosSeleccionados();

    return this.listado().filter((pelicula) => {
      const coincideNombre = termino === "" || normalizarTexto(pelicula.nombre).includes(termino);
      const coincideGeneros =
        generos.size === 0 || pelicula.generos.some((genero) => generos.has(genero.id));
      return coincideNombre && coincideGeneros;
    });
  }

  protected hayFiltrosActivos(): boolean {
    return this.terminoBusqueda().trim() !== "" || this.generosSeleccionados().size > 0;
  }

  protected readonly formatearDuracion = formatearDuracion;
  protected readonly formatearClasificacion = formatearClasificacion;

  constructor() {
    this.cargarDestacadas();
    this.cargarListado();
  }

  protected actualizarBusqueda(valor: string): void {
    this.terminoBusqueda.set(valor);
  }

  protected alternarGenero(id: string): void {
    const seleccionados = new Set(this.generosSeleccionados());
    if (seleccionados.has(id)) {
      seleccionados.delete(id);
    } else {
      seleccionados.add(id);
    }
    this.generosSeleccionados.set(seleccionados);
  }

  protected limpiarFiltros(): void {
    this.terminoBusqueda.set("");
    this.generosSeleccionados.set(new Set());
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
