import { Component, ElementRef, OnInit, inject, input, signal } from "@angular/core";
import { Router } from "@angular/router";
import { NotificacionesService } from "../../core/servicios/notificaciones.service";
import { Notificacion } from "../../core/modelos/alerta.model";

const FORMATEADOR_FECHA = new Intl.DateTimeFormat("es-AR", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

@Component({
  imports: [],
  selector: "app-campana-notificaciones",
  styleUrl: "./campana-notificaciones.scss",
  templateUrl: "./campana-notificaciones.html",
  host: { "(document:click)": "cerrarSiEsAfuera($event)" },
})
export class CampanaNotificaciones implements OnInit {
  private readonly notificacionesService = inject(NotificacionesService);
  private readonly router = inject(Router);
  private readonly elemento = inject(ElementRef);

  readonly usuarioId = input("");

  protected readonly notificaciones = signal<Notificacion[]>([]);
  protected readonly abierta = signal(false);
  protected readonly error = signal(false);

  ngOnInit(): void {
    void this.cargar();
  }

  protected noLeidas(): number {
    return this.notificaciones().filter((notificacion) => !notificacion.leida).length;
  }

  protected fecha(notificacion: Notificacion): string {
    return FORMATEADOR_FECHA.format(new Date(notificacion.creadaEn));
  }

  protected alternar(): void {
    this.abierta.update((abierta) => !abierta);
    if (this.abierta()) void this.cargar();
  }

  protected cerrarSiEsAfuera(evento: Event): void {
    if (this.abierta() && !this.elemento.nativeElement.contains(evento.target)) this.abierta.set(false);
  }

  protected async abrir(notificacion: Notificacion): Promise<void> {
    this.abierta.set(false);
    if (!notificacion.leida) await this.marcarLeidas([notificacion.id]);
    if (notificacion.peliculaId) await this.router.navigate(["/pelicula", notificacion.peliculaId]);
  }

  protected async marcarTodas(): Promise<void> {
    const ids = this.notificaciones()
      .filter((notificacion) => !notificacion.leida)
      .map((notificacion) => notificacion.id);
    if (ids.length > 0) await this.marcarLeidas(ids);
  }

  private async marcarLeidas(ids: string[]): Promise<void> {
    try {
      await this.notificacionesService.marcarLeidas(ids);
      this.notificaciones.update((lista) =>
        lista.map((notificacion) => (ids.includes(notificacion.id) ? { ...notificacion, leida: true } : notificacion)),
      );
    } catch {
      this.error.set(true);
    }
  }

  private async cargar(): Promise<void> {
    const usuarioId = this.usuarioId();
    if (!usuarioId) return;
    this.error.set(false);
    try {
      await this.notificacionesService.generarAvisosDeVenta(usuarioId);
      this.notificaciones.set(await this.notificacionesService.obtenerRecientes(usuarioId));
    } catch {
      this.error.set(true);
    }
  }
}
