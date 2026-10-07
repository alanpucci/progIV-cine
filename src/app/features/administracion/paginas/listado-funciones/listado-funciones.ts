import { Component, OnInit, inject, signal } from "@angular/core";
import { CargaGlobalService } from "../../../../core/servicios/carga-global.service";
import { formatearHoraFuncion } from "../../../../core/helpers/pelicula.formato";
import { FuncionAdministracion } from "../../modelos/funcion-administracion.model";
import { FuncionesAdministracionService } from "../../servicios/funciones-administracion.service";
import { mensajeDeError } from "../../helpers/errores-administracion";

interface DiaProgramacion {
  dia: string;
  funciones: FuncionAdministracion[];
}

const FORMATEADOR_DIA = new Intl.DateTimeFormat("es-AR", { weekday: "long", day: "numeric", month: "long" });

@Component({
  selector: "app-listado-funciones",
  standalone: false,
  styleUrl: "./listado-funciones.scss",
  templateUrl: "./listado-funciones.html",
})
export class ListadoFunciones implements OnInit {
  private readonly funcionesService = inject(FuncionesAdministracionService);
  protected readonly cargaGlobal = inject(CargaGlobalService);

  protected readonly funciones = signal<FuncionAdministracion[]>([]);
  protected readonly proximas = signal(true);
  protected readonly funcionAEliminar = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);

  protected readonly formatearHoraFuncion = formatearHoraFuncion;

  async ngOnInit(): Promise<void> {
    await this.ejecutar(() => this.cargar(), "No se pudo cargar la programación.");
  }

  protected diasProgramacion(): DiaProgramacion[] {
    const dias = new Map<string, FuncionAdministracion[]>();
    for (const funcion of this.funciones()) {
      const dia = FORMATEADOR_DIA.format(new Date(funcion.inicio));
      dias.set(dia, [...(dias.get(dia) ?? []), funcion]);
    }
    return [...dias].map(([dia, funciones]) => ({ dia, funciones }));
  }

  protected async cambiarVista(proximas: boolean): Promise<void> {
    if (this.proximas() === proximas) return;
    this.proximas.set(proximas);
    this.funcionAEliminar.set(null);
    await this.ejecutar(() => this.cargar(), "No se pudo cargar la programación.");
  }

  protected async confirmarEliminacion(id: string): Promise<void> {
    await this.ejecutar(async () => {
      await this.funcionesService.eliminar(id);
      this.funcionAEliminar.set(null);
      await this.cargar();
    }, "No se pudo eliminar la función.");
  }

  private async cargar(): Promise<void> {
    this.funciones.set(await this.funcionesService.obtenerListado(this.proximas()));
  }

  private async ejecutar(tarea: () => Promise<void>, mensajeGenerico: string): Promise<void> {
    this.error.set(null);
    try {
      await this.cargaGlobal.envolver(tarea);
    } catch (error) {
      this.funcionAEliminar.set(null);
      this.error.set(mensajeDeError(error, mensajeGenerico));
    }
  }
}
