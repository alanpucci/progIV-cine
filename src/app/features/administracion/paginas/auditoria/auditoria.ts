import { Component, OnInit, inject, signal } from "@angular/core";
import { CargaGlobalService } from "../../../../core/servicios/carga-global.service";
import { formatearFechaMovimiento } from "../../../../core/helpers/movimiento.formato";
import {
  AccionAuditada,
  EntidadAuditada,
  PersonalAuditado,
  RegistroActividad,
} from "../../modelos/auditoria-administracion.model";
import { AuditoriaAdministracionService } from "../../servicios/auditoria-administracion.service";
import { ETIQUETAS_ACCION, ETIQUETAS_ENTIDAD } from "../../helpers/auditoria-administracion.mapeos";
import { mensajeDeError } from "../../helpers/errores-administracion";

@Component({
  selector: "app-auditoria",
  standalone: false,
  styleUrl: "./auditoria.scss",
  templateUrl: "./auditoria.html",
})
export class Auditoria implements OnInit {
  private readonly auditoriaService = inject(AuditoriaAdministracionService);
  protected readonly cargaGlobal = inject(CargaGlobalService);

  protected readonly entidades = Object.entries(ETIQUETAS_ENTIDAD) as [EntidadAuditada, string][];
  protected readonly acciones = Object.entries(ETIQUETAS_ACCION) as [AccionAuditada, string][];

  protected readonly usuarioId = signal("");
  protected readonly entidad = signal<EntidadAuditada | "">("");
  protected readonly accion = signal<AccionAuditada | "">("");
  protected readonly desde = signal("");
  protected readonly hasta = signal("");

  protected readonly personal = signal<PersonalAuditado[]>([]);
  protected readonly registros = signal<RegistroActividad[]>([]);
  protected readonly error = signal<string | null>(null);

  async ngOnInit(): Promise<void> {
    await this.ejecutar(async () => {
      this.personal.set(await this.auditoriaService.obtenerPersonal());
      await this.cargar();
    });
  }

  protected async filtrar(): Promise<void> {
    await this.ejecutar(() => this.cargar());
  }

  protected async limpiar(): Promise<void> {
    this.usuarioId.set("");
    this.entidad.set("");
    this.accion.set("");
    this.desde.set("");
    this.hasta.set("");
    await this.filtrar();
  }

  protected fecha(registro: RegistroActividad): string {
    return formatearFechaMovimiento(registro.fecha);
  }

  protected etiquetaAccion(registro: RegistroActividad): string {
    return ETIQUETAS_ACCION[registro.accion] ?? registro.accion;
  }

  protected etiquetaEntidad(registro: RegistroActividad): string {
    return ETIQUETAS_ENTIDAD[registro.entidad] ?? registro.entidad;
  }

  protected referencia(registro: RegistroActividad): string {
    if (registro.referencia) return registro.referencia;
    return registro.entidadId ? `#${registro.entidadId.slice(0, 8).toUpperCase()}` : "";
  }

  private async cargar(): Promise<void> {
    this.registros.set(
      await this.auditoriaService.obtenerRegistros({
        usuarioId: this.usuarioId(),
        entidad: this.entidad(),
        accion: this.accion(),
        desde: this.desde(),
        hasta: this.hasta(),
      }),
    );
  }

  private async ejecutar(tarea: () => Promise<void>): Promise<void> {
    this.error.set(null);
    try {
      await this.cargaGlobal.envolver(tarea);
    } catch (error) {
      this.error.set(mensajeDeError(error, "No se pudo cargar el registro de actividad."));
    }
  }
}
