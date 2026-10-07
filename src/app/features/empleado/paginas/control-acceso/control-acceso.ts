import { Component, OnInit, inject, signal } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { AuthService } from "../../../../core/servicios/auth.service";
import { CargaGlobalService } from "../../../../core/servicios/carga-global.service";
import { formatearFechaFuncion, formatearHoraFuncion } from "../../../../core/helpers/pelicula.formato";
import { Boton } from "../../../../shared/componentes/boton/boton";
import { EscanerQr } from "../../componentes/escaner-qr/escaner-qr";
import { HistorialValidaciones } from "../../componentes/historial-validaciones/historial-validaciones";
import { ValidacionService } from "../../servicios/validacion.service";
import { normalizarCodigo } from "../../helpers/validacion.mapeos";
import { motivoRechazo } from "../../helpers/validacion.helpers";
import { ConceptoValidacion, LecturaQr, ResultadoValidacion, UsoQr } from "../../modelos/validacion.model";

@Component({
  imports: [FormsModule, Boton, EscanerQr, HistorialValidaciones],
  selector: "app-control-acceso",
  styleUrl: "./control-acceso.scss",
  templateUrl: "./control-acceso.html",
})
export class ControlAcceso implements OnInit {
  private readonly validacion = inject(ValidacionService);
  private readonly auth = inject(AuthService);
  private readonly cargaGlobal = inject(CargaGlobalService);

  protected readonly concepto = signal<ConceptoValidacion>("entrada");
  protected readonly codigo = signal("");
  protected readonly escaneando = signal(false);
  protected readonly lectura = signal<LecturaQr | null>(null);
  protected readonly historial = signal<UsoQr[]>([]);
  protected readonly error = signal<string | null>(null);

  protected readonly formatearFechaFuncion = formatearFechaFuncion;
  protected readonly formatearHoraFuncion = formatearHoraFuncion;

  private desdeCamara = false;

  ngOnInit(): void {
    void this.cargarHistorial();
  }

  protected operador(): string {
    return this.auth.sesion()?.user.email ?? "";
  }

  protected cambiarConcepto(concepto: ConceptoValidacion): void {
    this.concepto.set(concepto);
    this.lectura.set(null);
    this.error.set(null);
  }

  protected abrirCamara(): void {
    this.lectura.set(null);
    this.error.set(null);
    this.escaneando.set(true);
  }

  protected alLeer(codigo: string): void {
    this.escaneando.set(false);
    this.desdeCamara = true;
    void this.buscar(codigo);
  }

  protected buscarManual(): void {
    this.escaneando.set(false);
    this.desdeCamara = false;
    void this.buscar(this.codigo());
  }

  protected async confirmar(): Promise<void> {
    const lectura = this.lectura();
    const entrada = lectura?.entrada;
    if (!lectura || !entrada) return;
    this.error.set(null);
    try {
      await this.cargaGlobal.envolver(async () => {
        const consumido =
          lectura.concepto === "entrada"
            ? await this.validacion.validarEntrada(entrada.id)
            : await this.validacion.entregarCandy(entrada.ventaId);
        const resultado: ResultadoValidacion = consumido ? "validado" : "rechazado";
        this.lectura.set({
          ...lectura,
          resultado,
          motivoRechazo: consumido ? null : "El código se acaba de usar en otro puesto.",
        });
        await this.registrar(lectura, resultado);
      });
    } catch {
      this.error.set("No se pudo completar la validación. Intentá de nuevo.");
    }
  }

  protected siguiente(): void {
    this.lectura.set(null);
    this.codigo.set("");
    this.error.set(null);
    if (this.desdeCamara) this.escaneando.set(true);
  }

  private async buscar(texto: string): Promise<void> {
    const codigoQr = normalizarCodigo(texto);
    if (!codigoQr) return;
    const concepto = this.concepto();
    this.error.set(null);
    try {
      await this.cargaGlobal.envolver(async () => {
        const entrada = await this.validacion.buscarEntrada(codigoQr);
        const motivo = motivoRechazo(concepto, entrada);
        const lectura: LecturaQr = {
          concepto,
          codigoQr,
          entrada,
          resultado: motivo ? "rechazado" : null,
          motivoRechazo: motivo,
        };
        this.lectura.set(lectura);
        if (motivo) await this.registrar(lectura, "rechazado");
      });
    } catch {
      this.error.set("No se pudo buscar el código. Intentá de nuevo.");
    }
  }

  private async registrar(lectura: LecturaQr, resultado: ResultadoValidacion): Promise<void> {
    const empleadoId = this.auth.sesion()?.user.id;
    if (!empleadoId) return;
    await this.validacion.registrarUso(empleadoId, {
      codigoQr: lectura.codigoQr,
      entradaId: lectura.entrada?.id ?? null,
      concepto: lectura.concepto,
      resultado,
    });
    await this.cargarHistorial();
  }

  private async cargarHistorial(): Promise<void> {
    const empleadoId = this.auth.sesion()?.user.id;
    if (!empleadoId) return;
    try {
      this.historial.set(await this.validacion.obtenerHistorial(empleadoId, this.inicioSesion()));
    } catch {
      this.error.set("No se pudo cargar el historial de la sesión.");
    }
  }

  private inicioSesion(): string {
    const inicio = this.auth.sesion()?.user.last_sign_in_at;
    if (inicio) return inicio;
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return hoy.toISOString();
  }
}
