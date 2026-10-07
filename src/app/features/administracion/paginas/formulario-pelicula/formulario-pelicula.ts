import { Component, OnInit, inject, signal } from "@angular/core";
import { AbstractControl, FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { CargaGlobalService } from "../../../../core/servicios/carga-global.service";
import { GeneroAdministracion } from "../../modelos/pelicula-administracion.model";
import { PeliculasAdministracionService } from "../../servicios/peliculas-administracion.service";
import { GenerosAdministracionService } from "../../servicios/generos-administracion.service";
import { precioPreventaRequerido } from "../../validadores/pelicula.validadores";
import { mensajeDeError } from "../../helpers/errores-administracion";
import { sinEspaciosVacios } from "../../../../shared/validadores/texto.validadores";

const URL_IMAGEN = /^https?:\/\/\S+$/;
const ENTERO_POSITIVO = /^\d+$/;

@Component({
  selector: "app-formulario-pelicula",
  standalone: false,
  styleUrl: "./formulario-pelicula.scss",
  templateUrl: "./formulario-pelicula.html",
})
export class FormularioPelicula implements OnInit {
  private readonly peliculasService = inject(PeliculasAdministracionService);
  private readonly generosService = inject(GenerosAdministracionService);
  protected readonly cargaGlobal = inject(CargaGlobalService);
  private readonly fb = inject(FormBuilder);
  private readonly ruta = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly clasificaciones = [
    { valor: null, etiqueta: "ATP" },
    { valor: 13, etiqueta: "+13" },
    { valor: 18, etiqueta: "+18" },
  ];

  protected readonly peliculaId = signal("");
  protected readonly generos = signal<GeneroAdministracion[]>([]);
  protected readonly noEncontrada = signal(false);
  protected readonly intentoEnviar = signal(false);
  protected readonly errorEnvio = signal<string | null>(null);

  protected readonly formulario = this.fb.group(
    {
      nombre: ["", [Validators.required, sinEspaciosVacios]],
      duracionMinutos: [null as number | null, [Validators.required, Validators.min(1), Validators.pattern(ENTERO_POSITIVO)]],
      imagenUrl: ["", [Validators.required, Validators.pattern(URL_IMAGEN)]],
      sinopsis: ["", [Validators.required, sinEspaciosVacios]],
      clasificacionEdad: [null as number | null],
      fechaEstreno: ["", Validators.required],
      publicada: [true],
      preventaHabilitada: [false],
      precioPreventa: [{ value: null as number | null, disabled: true }, Validators.min(1)],
      generoIds: [[] as string[], Validators.required],
    },
    { validators: precioPreventaRequerido },
  );

  async ngOnInit(): Promise<void> {
    try {
      await this.cargaGlobal.envolver(() => this.cargarDatos());
    } catch (error) {
      this.errorEnvio.set(mensajeDeError(error, "No se pudieron cargar los datos de la película."));
    }
  }

  protected edicion(): boolean {
    return this.peliculaId() !== "";
  }

  protected mostrarError(control: AbstractControl): boolean {
    return control.invalid && (control.touched || this.intentoEnviar());
  }

  protected mostrarErrorPreventa(): boolean {
    return this.formulario.hasError("precioPreventaRequerido") && this.intentoEnviar();
  }

  protected generoSeleccionado(id: string): boolean {
    return (this.formulario.controls.generoIds.value ?? []).includes(id);
  }

  protected alternarGenero(id: string): void {
    const control = this.formulario.controls.generoIds;
    const actuales = control.value ?? [];
    control.setValue(actuales.includes(id) ? actuales.filter((generoId) => generoId !== id) : [...actuales, id]);
    control.markAsTouched();
  }

  protected sincronizarPrecioPreventa(): void {
    const precio = this.formulario.controls.precioPreventa;
    if (this.formulario.controls.preventaHabilitada.value) {
      precio.enable();
    } else {
      precio.disable();
    }
  }

  protected vistaPrevia(): string {
    const control = this.formulario.controls.imagenUrl;
    return control.valid ? (control.value ?? "") : "";
  }

  protected async guardar(): Promise<void> {
    this.intentoEnviar.set(true);
    this.errorEnvio.set(null);
    if (this.formulario.invalid) return;

    const valores = this.formulario.value;
    const datos = {
      nombre: (valores.nombre ?? "").trim(),
      duracionMinutos: Number(valores.duracionMinutos),
      imagenUrl: (valores.imagenUrl ?? "").trim(),
      sinopsis: (valores.sinopsis ?? "").trim(),
      clasificacionEdad: valores.clasificacionEdad ?? null,
      fechaEstreno: valores.fechaEstreno ?? "",
      publicada: valores.publicada ?? true,
      preventaHabilitada: valores.preventaHabilitada ?? false,
      precioPreventa: valores.precioPreventa ?? null,
      generoIds: valores.generoIds ?? [],
    };

    try {
      await this.cargaGlobal.envolver(() =>
        this.edicion()
          ? this.peliculasService.actualizar(this.peliculaId(), datos)
          : this.peliculasService.crear(datos),
      );
      this.router.navigate(["/administracion/peliculas"]);
    } catch (error) {
      this.errorEnvio.set(mensajeDeError(error, "No se pudo guardar la película. Intentá de nuevo."));
    }
  }

  private async cargarDatos(): Promise<void> {
    this.generos.set(await this.generosService.obtenerListado());

    const id = this.ruta.snapshot.paramMap.get("id");
    if (!id) return;

    const pelicula = await this.peliculasService.obtenerPorId(id);
    if (!pelicula) {
      this.noEncontrada.set(true);
      return;
    }

    this.peliculaId.set(pelicula.id);
    this.formulario.setValue({
      nombre: pelicula.nombre,
      duracionMinutos: pelicula.duracionMinutos,
      imagenUrl: pelicula.imagenUrl,
      sinopsis: pelicula.sinopsis,
      clasificacionEdad: pelicula.clasificacionEdad,
      fechaEstreno: pelicula.fechaEstreno,
      publicada: pelicula.publicada,
      preventaHabilitada: pelicula.preventaHabilitada,
      precioPreventa: pelicula.precioPreventa,
      generoIds: pelicula.generos.map((genero) => genero.id),
    });
    this.sincronizarPrecioPreventa();
  }
}
