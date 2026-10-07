import { Component, OnInit, inject, signal } from "@angular/core";
import { AbstractControl, FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { CargaGlobalService } from "../../../../core/servicios/carga-global.service";
import { Idioma, TipoProyeccion } from "../../../../core/modelos/funcion.model";
import { formatearDuracion, formatearHoraFuncion } from "../../../../core/helpers/pelicula.formato";
import { OpcionPelicula, OpcionSala } from "../../modelos/funcion-administracion.model";
import { FuncionesAdministracionService } from "../../servicios/funciones-administracion.service";
import {
  MARGEN_ENTRE_FUNCIONES_MINUTOS,
  fechaHoraLocal,
  sumarMinutos,
} from "../../helpers/funcion-administracion.mapeos";
import { fechaHoraFutura } from "../../validadores/funcion.validadores";
import { mensajeDeError } from "../../helpers/errores-administracion";

@Component({
  selector: "app-formulario-funcion",
  standalone: false,
  styleUrl: "./formulario-funcion.scss",
  templateUrl: "./formulario-funcion.html",
})
export class FormularioFuncion implements OnInit {
  private readonly funcionesService = inject(FuncionesAdministracionService);
  protected readonly cargaGlobal = inject(CargaGlobalService);
  private readonly fb = inject(FormBuilder);
  private readonly ruta = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly tiposProyeccion: TipoProyeccion[] = ["2D", "3D", "4D", "5D"];
  protected readonly idiomas: { valor: Idioma; etiqueta: string }[] = [
    { valor: "castellano", etiqueta: "Castellano" },
    { valor: "subtitulada", etiqueta: "Subtitulada" },
  ];
  protected readonly margenMinutos = MARGEN_ENTRE_FUNCIONES_MINUTOS;
  protected readonly formatearHoraFuncion = formatearHoraFuncion;
  protected readonly formatearDuracion = formatearDuracion;

  protected readonly funcionId = signal("");
  protected readonly peliculas = signal<OpcionPelicula[]>([]);
  protected readonly salas = signal<OpcionSala[]>([]);
  protected readonly noEncontrada = signal(false);
  protected readonly conVentas = signal(false);
  protected readonly intentoEnviar = signal(false);
  protected readonly errorEnvio = signal<string | null>(null);

  protected readonly formulario = this.fb.group({
    peliculaId: ["", Validators.required],
    inicio: ["", [Validators.required, fechaHoraFutura]],
    tipoProyeccion: ["2D" as TipoProyeccion, Validators.required],
    idioma: ["castellano" as Idioma, Validators.required],
    precioBase: [null as number | null, [Validators.required, Validators.min(1)]],
    salaId: [""],
  });

  async ngOnInit(): Promise<void> {
    try {
      await this.cargaGlobal.envolver(() => this.cargarDatos());
    } catch (error) {
      this.errorEnvio.set(mensajeDeError(error, "No se pudieron cargar los datos de la función."));
    }
  }

  protected edicion(): boolean {
    return this.funcionId() !== "";
  }

  protected mostrarError(control: AbstractControl): boolean {
    return control.invalid && (control.touched || this.intentoEnviar());
  }

  protected peliculaElegida(): OpcionPelicula | null {
    return this.peliculas().find((pelicula) => pelicula.id === this.formulario.controls.peliculaId.value) ?? null;
  }

  protected inicioElegido(): string {
    const control = this.formulario.controls.inicio;
    return control.value && !control.hasError("required") ? new Date(control.value).toISOString() : "";
  }

  protected finEstimado(): string {
    const pelicula = this.peliculaElegida();
    const inicio = this.inicioElegido();
    return pelicula && inicio ? sumarMinutos(inicio, pelicula.duracionMinutos) : "";
  }

  protected salaLibreDesde(): string {
    const fin = this.finEstimado();
    return fin ? sumarMinutos(fin, MARGEN_ENTRE_FUNCIONES_MINUTOS) : "";
  }

  protected async guardar(): Promise<void> {
    this.intentoEnviar.set(true);
    this.errorEnvio.set(null);
    if (this.formulario.invalid) return;

    const valores = this.formulario.value;
    const datos = {
      peliculaId: valores.peliculaId ?? "",
      salaId: valores.salaId ?? "",
      inicio: this.inicioElegido(),
      fin: this.finEstimado(),
      tipoProyeccion: valores.tipoProyeccion ?? "2D",
      idioma: valores.idioma ?? "castellano",
      precioBase: Number(valores.precioBase),
    };

    try {
      await this.cargaGlobal.envolver(() =>
        this.edicion()
          ? this.funcionesService.actualizar(this.funcionId(), datos)
          : this.funcionesService.crear(datos),
      );
      this.router.navigate(["/administracion/funciones"]);
    } catch (error) {
      this.errorEnvio.set(mensajeDeError(error, "No se pudo guardar la función. Intentá de nuevo."));
    }
  }

  private async cargarDatos(): Promise<void> {
    const [peliculas, salas] = await Promise.all([
      this.funcionesService.obtenerPeliculas(),
      this.funcionesService.obtenerSalasActivas(),
    ]);
    this.peliculas.set(peliculas);
    this.salas.set(salas);

    const id = this.ruta.snapshot.paramMap.get("id");
    if (!id) return;

    const funcion = await this.funcionesService.obtenerPorId(id);
    if (!funcion) {
      this.noEncontrada.set(true);
      return;
    }

    this.funcionId.set(funcion.id);
    this.conVentas.set(funcion.entradasVendidas > 0);
    this.formulario.setValue({
      peliculaId: funcion.peliculaId,
      inicio: fechaHoraLocal(funcion.inicio),
      tipoProyeccion: funcion.tipoProyeccion,
      idioma: funcion.idioma,
      precioBase: funcion.precioBase,
      salaId: funcion.salaId,
    });
  }
}
