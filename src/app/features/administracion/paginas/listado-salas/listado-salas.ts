import { Component, OnInit, inject, signal } from "@angular/core";
import { CargaGlobalService } from "../../../../core/servicios/carga-global.service";
import { SalaAdministracion } from "../../modelos/sala-administracion.model";
import { SalasAdministracionService } from "../../servicios/salas-administracion.service";
import { mensajeDeError } from "../../helpers/errores-administracion";

@Component({
  selector: "app-listado-salas",
  standalone: false,
  styleUrl: "./listado-salas.scss",
  templateUrl: "./listado-salas.html",
})
export class ListadoSalas implements OnInit {
  private readonly salasService = inject(SalasAdministracionService);
  protected readonly cargaGlobal = inject(CargaGlobalService);

  protected readonly salas = signal<SalaAdministracion[]>([]);
  protected readonly salaAEliminar = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    await this.ejecutar(() => this.cargar(), "No se pudo cargar el listado de salas.");
  }

  protected async alternarActivacion(sala: SalaAdministracion): Promise<void> {
    await this.ejecutar(async () => {
      await this.salasService.cambiarActivacion(sala.id, !sala.activa);
      await this.cargar();
    }, "No se pudo cambiar el estado de la sala.");
  }

  protected async confirmarEliminacion(id: string): Promise<void> {
    await this.ejecutar(async () => {
      await this.salasService.eliminar(id);
      this.salaAEliminar.set(null);
      await this.cargar();
    }, "No se pudo eliminar la sala.");
  }

  private async cargar(): Promise<void> {
    this.salas.set(await this.salasService.obtenerListado());
  }

  private async ejecutar(tarea: () => Promise<void>, mensajeGenerico: string): Promise<void> {
    this.error.set(null);
    try {
      await this.cargaGlobal.envolver(tarea);
    } catch (error) {
      this.salaAEliminar.set(null);
      this.error.set(mensajeDeError(error, mensajeGenerico));
    }
  }
}
