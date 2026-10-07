import { Component, OnInit, inject, signal } from "@angular/core";
import { CargaGlobalService } from "../../../../core/servicios/carga-global.service";
import { CuponAdministracion, TipoCupon } from "../../modelos/cupon-administracion.model";
import { CuponesAdministracionService } from "../../servicios/cupones-administracion.service";
import { mensajeDeError } from "../../helpers/errores-administracion";

const FORMATEADOR_FECHA = new Intl.DateTimeFormat("es-AR", { day: "numeric", month: "short", year: "numeric" });

const ETIQUETAS_TIPO: Record<TipoCupon, string> = {
  primera_compra: "Primera compra",
  edad: "Por edad",
  general: "General",
};

@Component({
  selector: "app-listado-cupones",
  standalone: false,
  styleUrl: "./listado-cupones.scss",
  templateUrl: "./listado-cupones.html",
})
export class ListadoCupones implements OnInit {
  private readonly cuponesService = inject(CuponesAdministracionService);
  protected readonly cargaGlobal = inject(CargaGlobalService);

  protected readonly cupones = signal<CuponAdministracion[]>([]);
  protected readonly cuponAEliminar = signal<string | null>(null);
  protected readonly error = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    await this.ejecutar(() => this.cargar(), "No se pudo cargar el listado de cupones.");
  }

  protected tipo(cupon: CuponAdministracion): string {
    return cupon.tipo === "edad" ? `Mayores de ${cupon.edadMinima}` : ETIQUETAS_TIPO[cupon.tipo];
  }

  protected vigencia(cupon: CuponAdministracion): string {
    const desde = cupon.fechaInicio ? FORMATEADOR_FECHA.format(new Date(cupon.fechaInicio)) : "";
    const hasta = cupon.fechaFin ? FORMATEADOR_FECHA.format(new Date(cupon.fechaFin)) : "";
    if (desde && hasta) return `Del ${desde} al ${hasta}`;
    if (desde) return `Desde el ${desde}`;
    if (hasta) return `Hasta el ${hasta}`;
    return "Sin vencimiento";
  }

  protected estado(cupon: CuponAdministracion): "inactivo" | "programado" | "vencido" | "vigente" {
    const ahora = new Date();
    if (!cupon.activo) return "inactivo";
    if (cupon.fechaInicio && ahora < new Date(cupon.fechaInicio)) return "programado";
    if (cupon.fechaFin && ahora > new Date(cupon.fechaFin)) return "vencido";
    return "vigente";
  }

  protected async alternarActivacion(cupon: CuponAdministracion): Promise<void> {
    await this.ejecutar(async () => {
      await this.cuponesService.cambiarActivacion(cupon.id, !cupon.activo);
      await this.cargar();
    }, "No se pudo cambiar el estado del cupón.");
  }

  protected async confirmarEliminacion(id: string): Promise<void> {
    await this.ejecutar(async () => {
      await this.cuponesService.eliminar(id);
      this.cuponAEliminar.set(null);
      await this.cargar();
    }, "No se pudo eliminar el cupón.");
  }

  private async cargar(): Promise<void> {
    this.cupones.set(await this.cuponesService.obtenerListado());
  }

  private async ejecutar(tarea: () => Promise<void>, mensajeGenerico: string): Promise<void> {
    this.error.set(null);
    try {
      await this.cargaGlobal.envolver(tarea);
    } catch (error) {
      this.cuponAEliminar.set(null);
      this.error.set(mensajeDeError(error, mensajeGenerico));
    }
  }
}
