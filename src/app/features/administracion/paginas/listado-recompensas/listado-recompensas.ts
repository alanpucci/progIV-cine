import { Component, OnInit, inject, signal } from "@angular/core";
import { CargaGlobalService } from "../../../../core/servicios/carga-global.service";
import { formatearPuntos } from "../../../../core/helpers/movimiento.formato";
import { RecompensaAdministracion } from "../../modelos/recompensa-administracion.model";
import { RecompensasAdministracionService } from "../../servicios/recompensas-administracion.service";
import { mensajeDeError } from "../../helpers/errores-administracion";

@Component({
  selector: "app-listado-recompensas",
  standalone: false,
  styleUrl: "./listado-recompensas.scss",
  templateUrl: "./listado-recompensas.html",
})
export class ListadoRecompensas implements OnInit {
  private readonly recompensasService = inject(RecompensasAdministracionService);
  protected readonly cargaGlobal = inject(CargaGlobalService);
  protected readonly formatearPuntos = formatearPuntos;

  protected readonly recompensas = signal<RecompensaAdministracion[]>([]);
  protected readonly recompensaAEliminar = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    await this.ejecutar(() => this.cargar(), "No se pudo cargar el listado de recompensas.");
  }

  protected canje(recompensa: RecompensaAdministracion): string {
    if (recompensa.tipo === "entrada") return "Una entrada sin cargo";
    return recompensa.productoNombre ? `${recompensa.productoNombre} sin cargo` : "Producto no disponible";
  }

  protected async alternarActivacion(recompensa: RecompensaAdministracion): Promise<void> {
    await this.ejecutar(async () => {
      await this.recompensasService.cambiarActivacion(recompensa.id, !recompensa.activo);
      await this.cargar();
    }, "No se pudo cambiar el estado de la recompensa.");
  }

  protected async confirmarEliminacion(id: string): Promise<void> {
    await this.ejecutar(async () => {
      await this.recompensasService.eliminar(id);
      this.recompensaAEliminar.set(null);
      await this.cargar();
    }, "No se pudo eliminar la recompensa.");
  }

  private async cargar(): Promise<void> {
    this.recompensas.set(await this.recompensasService.obtenerListado());
  }

  private async ejecutar(tarea: () => Promise<void>, mensajeGenerico: string): Promise<void> {
    this.error.set(null);
    try {
      await this.cargaGlobal.envolver(tarea);
    } catch (error) {
      this.recompensaAEliminar.set(null);
      this.error.set(mensajeDeError(error, mensajeGenerico));
    }
  }
}
