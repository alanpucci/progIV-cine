import { Component, inject, input, output, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { AuthService } from "../../../core/servicios/auth.service";
import { AlertasEstrenoService } from "../../../core/servicios/alertas-estreno.service";

@Component({
  imports: [RouterLink],
  selector: "app-interruptor-alerta",
  styleUrl: "./interruptor-alerta.scss",
  templateUrl: "./interruptor-alerta.html",
})
export class InterruptorAlerta {
  protected readonly auth = inject(AuthService);
  private readonly alertas = inject(AlertasEstrenoService);

  readonly peliculaId = input("");
  readonly activa = input(false);
  readonly cambio = output<boolean>();

  protected readonly procesando = signal(false);
  protected readonly error = signal(false);

  protected async alternar(): Promise<void> {
    const usuarioId = this.auth.sesion()?.user.id;
    const peliculaId = this.peliculaId();
    if (!usuarioId || !peliculaId) return;

    this.procesando.set(true);
    this.error.set(false);
    try {
      if (this.activa()) {
        await this.alertas.desactivar(usuarioId, peliculaId);
      } else {
        await this.alertas.activar(usuarioId, peliculaId);
      }
      this.cambio.emit(!this.activa());
    } catch {
      this.error.set(true);
    } finally {
      this.procesando.set(false);
    }
  }
}
