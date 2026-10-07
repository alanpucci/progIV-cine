import { Component, OnInit, inject, input, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { AlertasEstrenoService } from "../../../../core/servicios/alertas-estreno.service";
import { CargaGlobalService } from "../../../../core/servicios/carga-global.service";
import { AlertaEstreno } from "../../../../core/modelos/alerta.model";
import { formatearFechaEstreno } from "../../../../core/helpers/pelicula.formato";
import { aperturaDeVenta } from "../../../../core/helpers/preventa.helpers";
import { InterruptorAlerta } from "../../../../shared/componentes/interruptor-alerta/interruptor-alerta";

@Component({
  imports: [RouterLink, InterruptorAlerta],
  selector: "app-mis-alertas",
  styleUrl: "./mis-alertas.scss",
  templateUrl: "./mis-alertas.html",
})
export class MisAlertas implements OnInit {
  private readonly alertas = inject(AlertasEstrenoService);
  private readonly cargaGlobal = inject(CargaGlobalService);

  readonly usuarioId = input("");

  protected readonly lista = signal<AlertaEstreno[] | null>(null);
  protected readonly errorCarga = signal<string | null>(null);

  protected readonly formatearFechaEstreno = formatearFechaEstreno;

  ngOnInit(): void {
    void this.cargar();
  }

  protected apertura(alerta: AlertaEstreno): string {
    return formatearFechaEstreno(aperturaDeVenta(alerta));
  }

  protected quitar(peliculaId: string): void {
    this.lista.update((lista) => (lista ?? []).filter((alerta) => alerta.peliculaId !== peliculaId));
  }

  private async cargar(): Promise<void> {
    const usuarioId = this.usuarioId();
    if (!usuarioId) return;
    try {
      this.lista.set(await this.cargaGlobal.envolver(() => this.alertas.obtenerActivas(usuarioId)));
    } catch {
      this.errorCarga.set("No se pudieron cargar tus alertas.");
    }
  }
}
