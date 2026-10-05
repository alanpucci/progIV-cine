import { Component, OnInit, inject, signal } from "@angular/core";
import { RouterLink } from "@angular/router";
import { AuthService } from "../../../../core/servicios/auth.service";
import { CargaGlobalService } from "../../../../core/servicios/carga-global.service";
import { PdfEntradasService } from "../../../../core/servicios/pdf-entradas.service";
import { EstadoEntrada } from "../../../../core/modelos/entrada.model";
import { formatearFechaFuncion, formatearHoraFuncion } from "../../../../core/helpers/pelicula.formato";
import { Boton } from "../../../../shared/componentes/boton/boton";
import { TicketEntrada } from "../../../../shared/componentes/ticket-entrada/ticket-entrada";
import { EntradasService } from "../../servicios/entradas.service";
import { EntradaUsuario, FuncionConEntradas } from "../../modelos/entrada-usuario.model";

type Vista = "proximas" | "pasadas";

const ETIQUETAS_ESTADO: Record<EstadoEntrada, string> = {
  emitida: "Sin usar",
  validada: "Validada",
  cancelada: "Cancelada",
};

const FORMATEADOR_DIA = new Intl.DateTimeFormat("es-AR", { day: "numeric" });
const FORMATEADOR_MES = new Intl.DateTimeFormat("es-AR", { month: "short" });

@Component({
  imports: [RouterLink, Boton, TicketEntrada],
  selector: "app-mis-entradas",
  styleUrl: "./mis-entradas.scss",
  templateUrl: "./mis-entradas.html",
})
export class MisEntradas implements OnInit {
  private readonly entradas = inject(EntradasService);
  private readonly auth = inject(AuthService);
  private readonly pdfEntradas = inject(PdfEntradasService);
  private readonly cargaGlobal = inject(CargaGlobalService);

  protected readonly grupos = signal<FuncionConEntradas[] | null>(null);
  protected readonly vista = signal<Vista>("proximas");
  protected readonly errorCarga = signal<string | null>(null);
  protected readonly errorPdf = signal<string | null>(null);

  protected readonly formatearFechaFuncion = formatearFechaFuncion;
  protected readonly formatearHoraFuncion = formatearHoraFuncion;

  ngOnInit(): void {
    void this.cargar();
  }

  protected proximas(): FuncionConEntradas[] {
    return (this.grupos() ?? [])
      .filter((grupo) => !this.terminada(grupo))
      .sort((a, b) => a.funcion.inicio.localeCompare(b.funcion.inicio));
  }

  protected pasadas(): FuncionConEntradas[] {
    return (this.grupos() ?? [])
      .filter((grupo) => this.terminada(grupo))
      .sort((a, b) => b.funcion.inicio.localeCompare(a.funcion.inicio));
  }

  protected gruposVisibles(): FuncionConEntradas[] {
    return this.vista() === "proximas" ? this.proximas() : this.pasadas();
  }

  protected emitidas(grupo: FuncionConEntradas): EntradaUsuario[] {
    return grupo.entradas.filter((entrada) => entrada.estado === "emitida");
  }

  protected dia(inicio: string): string {
    return FORMATEADOR_DIA.format(new Date(inicio));
  }

  protected mes(inicio: string): string {
    return FORMATEADOR_MES.format(new Date(inicio)).replace(".", "");
  }

  protected etiquetaEstado(entrada: EntradaUsuario): string {
    return ETIQUETAS_ESTADO[entrada.estado];
  }

  protected async descargarPdf(grupo: FuncionConEntradas): Promise<void> {
    this.errorPdf.set(null);
    try {
      await this.cargaGlobal.envolver(() => this.pdfEntradas.descargar(grupo.funcion, this.emitidas(grupo)));
    } catch {
      this.errorPdf.set(grupo.id);
    }
  }

  private terminada(grupo: FuncionConEntradas): boolean {
    return new Date(grupo.fin).getTime() <= Date.now();
  }

  private async cargar(): Promise<void> {
    const usuarioId = this.auth.sesion()?.user.id;
    if (!usuarioId) return;
    try {
      const grupos = await this.cargaGlobal.envolver(() => this.entradas.obtenerEntradasPropias(usuarioId));
      this.grupos.set(grupos);
    } catch {
      this.errorCarga.set("No se pudieron cargar tus entradas.");
    }
  }
}
