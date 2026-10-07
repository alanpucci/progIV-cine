import { Component, inject, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { PeliculasService } from "../../../../core/servicios/peliculas.service";
import { AlertasEstrenoService } from "../../../../core/servicios/alertas-estreno.service";
import { AuthService } from "../../../../core/servicios/auth.service";
import { CargaGlobalService } from "../../../../core/servicios/carga-global.service";
import { PeliculaResumen } from "../../../../core/modelos/pelicula.model";
import {
  formatearClasificacion,
  formatearDuracion,
  formatearFechaEstreno,
} from "../../../../core/helpers/pelicula.formato";
import { aperturaDeVenta, estadoVenta } from "../../../../core/helpers/preventa.helpers";
import { InterruptorAlerta } from "../../../../shared/componentes/interruptor-alerta/interruptor-alerta";

const FORMATEADOR_MES = new Intl.DateTimeFormat("es-AR", { month: "short" });

@Component({
  imports: [RouterLink, InterruptorAlerta],
  selector: "app-proximamente-inicio",
  styleUrl: "./proximamente-inicio.scss",
  templateUrl: "./proximamente-inicio.html",
})
export class ProximamenteInicio {
  private readonly peliculasService = inject(PeliculasService);
  private readonly alertas = inject(AlertasEstrenoService);
  private readonly auth = inject(AuthService);
  protected readonly cargaGlobal = inject(CargaGlobalService);

  protected readonly estrenos = signal<PeliculaResumen[]>([]);
  protected readonly idsConAlerta = signal<string[]>([]);
  protected readonly error = signal(false);

  protected readonly estadoVenta = estadoVenta;
  protected readonly formatearDuracion = formatearDuracion;
  protected readonly formatearClasificacion = formatearClasificacion;
  protected readonly formatearFechaEstreno = formatearFechaEstreno;

  constructor() {
    void this.cargar();
  }

  protected dia(fecha: string): string {
    return fecha.slice(8, 10);
  }

  protected mes(fecha: string): string {
    return FORMATEADOR_MES.format(new Date(`${fecha}T00:00:00`)).replace(".", "");
  }

  protected apertura(pelicula: PeliculaResumen): string {
    return formatearFechaEstreno(aperturaDeVenta(pelicula));
  }

  protected actualizarAlerta(peliculaId: string, activa: boolean): void {
    this.idsConAlerta.update((ids) =>
      activa ? [...ids, peliculaId] : ids.filter((id) => id !== peliculaId),
    );
  }

  private async cargar(): Promise<void> {
    try {
      const estrenos = await this.cargaGlobal.envolver(() => this.peliculasService.obtenerProximosEstrenos());
      this.estrenos.set(estrenos);
    } catch {
      this.error.set(true);
      return;
    }

    const usuarioId = this.auth.sesion()?.user.id;
    if (!usuarioId) return;
    try {
      this.idsConAlerta.set(await this.alertas.obtenerIdsPeliculasConAlerta(usuarioId));
    } catch {
      this.idsConAlerta.set([]);
    }
  }
}
