import { Component, OnInit, inject, signal } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { CargaGlobalService } from "../../../../core/servicios/carga-global.service";
import { GeneroAdministracion } from "../../modelos/pelicula-administracion.model";
import { GenerosAdministracionService } from "../../servicios/generos-administracion.service";
import { mensajeDeError } from "../../helpers/errores-administracion";
import { sinEspaciosVacios } from "../../../../shared/validadores/texto.validadores";


@Component({
  selector: "app-generos-peliculas",
  standalone: false,
  styleUrl: "./generos-peliculas.scss",
  templateUrl: "./generos-peliculas.html",
})
export class GenerosPeliculas implements OnInit {
  private readonly generosService = inject(GenerosAdministracionService);
  protected readonly cargaGlobal = inject(CargaGlobalService);
  private readonly fb = inject(FormBuilder);

  protected readonly generos = signal<GeneroAdministracion[]>([]);
  protected readonly generoEditando = signal<string | null>(null);
  protected readonly generoAEliminar = signal<string | null>(null);
  protected readonly intentoAgregar = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly formularioAlta = this.fb.nonNullable.group({
    nombre: ["", [Validators.required, sinEspaciosVacios]],
  });
  protected readonly formularioEdicion = this.fb.nonNullable.group({
    nombre: ["", [Validators.required, sinEspaciosVacios]],
  });

  async ngOnInit(): Promise<void> {
    await this.ejecutar(() => this.cargar(), "No se pudo cargar el listado de géneros.");
  }

  protected async agregar(): Promise<void> {
    this.intentoAgregar.set(true);
    if (this.formularioAlta.invalid) return;

    await this.ejecutar(async () => {
      await this.generosService.crear((this.formularioAlta.value.nombre ?? "").trim());
      this.formularioAlta.reset();
      this.intentoAgregar.set(false);
      await this.cargar();
    }, "No se pudo agregar el género.");
  }

  protected empezarEdicion(genero: GeneroAdministracion): void {
    this.generoAEliminar.set(null);
    this.generoEditando.set(genero.id);
    this.formularioEdicion.setValue({ nombre: genero.nombre });
  }

  protected async guardarEdicion(id: string): Promise<void> {
    if (this.formularioEdicion.invalid) return;

    await this.ejecutar(async () => {
      await this.generosService.renombrar(id, (this.formularioEdicion.value.nombre ?? "").trim());
      this.generoEditando.set(null);
      await this.cargar();
    }, "No se pudo renombrar el género.");
  }

  protected pedirEliminacion(id: string): void {
    this.generoEditando.set(null);
    this.generoAEliminar.set(id);
  }

  protected async confirmarEliminacion(id: string): Promise<void> {
    await this.ejecutar(async () => {
      await this.generosService.eliminar(id);
      this.generoAEliminar.set(null);
      await this.cargar();
    }, "No se pudo eliminar el género.");
  }

  private async cargar(): Promise<void> {
    this.generos.set(await this.generosService.obtenerListado());
  }

  private async ejecutar(tarea: () => Promise<void>, mensajeGenerico: string): Promise<void> {
    this.error.set(null);
    try {
      await this.cargaGlobal.envolver(tarea);
    } catch (error) {
      this.error.set(mensajeDeError(error, mensajeGenerico));
    }
  }
}
