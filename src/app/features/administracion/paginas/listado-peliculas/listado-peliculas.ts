import { Component, OnInit, inject, signal } from "@angular/core";
import { CargaGlobalService } from "../../../../core/servicios/carga-global.service";
import {
  formatearClasificacion,
  formatearDuracion,
  formatearFechaEstreno,
} from "../../../../core/helpers/pelicula.formato";
import { PeliculaAdministracion } from "../../modelos/pelicula-administracion.model";
import { PeliculasAdministracionService } from "../../servicios/peliculas-administracion.service";
import { mensajeDeError } from "../../helpers/errores-administracion";

@Component({
  selector: "app-listado-peliculas",
  standalone: false,
  styleUrl: "./listado-peliculas.scss",
  templateUrl: "./listado-peliculas.html",
})
export class ListadoPeliculas implements OnInit {
  private readonly peliculasService = inject(PeliculasAdministracionService);
  protected readonly cargaGlobal = inject(CargaGlobalService);

  protected readonly peliculas = signal<PeliculaAdministracion[]>([]);
  protected readonly peliculaAEliminar = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);

  protected readonly formatearDuracion = formatearDuracion;
  protected readonly formatearClasificacion = formatearClasificacion;
  protected readonly formatearFechaEstreno = formatearFechaEstreno;

  async ngOnInit(): Promise<void> {
    await this.ejecutar(() => this.cargar(), "No se pudo cargar el listado de películas.");
  }

  protected nombresGeneros(pelicula: PeliculaAdministracion): string {
    return pelicula.generos.map((genero) => genero.nombre).join(" · ") || "Sin géneros";
  }

  protected async alternarPublicacion(pelicula: PeliculaAdministracion): Promise<void> {
    await this.ejecutar(async () => {
      await this.peliculasService.cambiarPublicacion(pelicula.id, !pelicula.publicada);
      await this.cargar();
    }, "No se pudo cambiar la visibilidad de la película.");
  }

  protected async confirmarEliminacion(id: string): Promise<void> {
    await this.ejecutar(async () => {
      await this.peliculasService.eliminar(id);
      this.peliculaAEliminar.set(null);
      await this.cargar();
    }, "No se pudo eliminar la película.");
  }

  private async cargar(): Promise<void> {
    this.peliculas.set(await this.peliculasService.obtenerListado());
  }

  private async ejecutar(tarea: () => Promise<void>, mensajeGenerico: string): Promise<void> {
    this.error.set(null);
    try {
      await this.cargaGlobal.envolver(tarea);
    } catch (error) {
      this.peliculaAEliminar.set(null);
      this.error.set(mensajeDeError(error, mensajeGenerico));
    }
  }
}
