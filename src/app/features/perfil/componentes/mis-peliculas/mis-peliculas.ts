import { Component, OnInit, inject, input, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { CargaGlobalService } from "../../../../core/servicios/carga-global.service";
import { ComprasService } from "../../../../core/servicios/compras.service";
import { PeliculaVista } from "../../../../core/modelos/compra.model";
import { formatearFechaEstreno } from "../../../../core/helpers/pelicula.formato";
import { fechaIsoLocal } from "../../../../shared/validadores/fecha.validadores";

const ESTRELLAS_MAXIMAS = [1, 2, 3, 4, 5];

@Component({
  imports: [RouterLink],
  selector: "app-mis-peliculas",
  styleUrl: "./mis-peliculas.scss",
  templateUrl: "./mis-peliculas.html",
})
export class MisPeliculas implements OnInit {
  private readonly compras = inject(ComprasService);
  private readonly cargaGlobal = inject(CargaGlobalService);

  readonly usuarioId = input("");

  protected readonly estrellasMaximas = ESTRELLAS_MAXIMAS;
  protected readonly peliculas = signal<PeliculaVista[] | null>(null);
  protected readonly errorCarga = signal<string | null>(null);

  ngOnInit(): void {
    void this.cargar();
  }

  protected fechaVista(pelicula: PeliculaVista): string {
    return formatearFechaEstreno(fechaIsoLocal(new Date(pelicula.ultimaFuncion)));
  }

  private async cargar(): Promise<void> {
    const usuarioId = this.usuarioId();
    if (!usuarioId) return;
    try {
      const peliculas = await this.cargaGlobal.envolver(() => this.compras.obtenerPeliculasVistas(usuarioId));
      this.peliculas.set(peliculas);
    } catch {
      this.errorCarga.set("No se pudieron cargar tus películas.");
    }
  }
}
