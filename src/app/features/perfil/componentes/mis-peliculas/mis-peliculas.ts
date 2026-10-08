import { Component, OnInit, inject, input, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { CargaGlobalService } from "../../../../core/servicios/carga-global.service";
import { ComprasService } from "../../../../core/servicios/compras.service";
import { ResenasService } from "../../../../core/servicios/resenas.service";
import { PeliculaVista } from "../../../../core/modelos/compra.model";
import { formatearFechaEstreno } from "../../../../core/helpers/pelicula.formato";
import { fechaIsoLocal } from "../../../../shared/validadores/fecha.validadores";
import { Boton } from "../../../../shared/componentes/boton/boton";

const ESTRELLAS_MAXIMAS = [1, 2, 3, 4, 5];
const LARGO_MAXIMO_COMENTARIO = 500;

@Component({
  imports: [RouterLink, ReactiveFormsModule, Boton],
  selector: "app-mis-peliculas",
  styleUrl: "./mis-peliculas.scss",
  templateUrl: "./mis-peliculas.html",
})
export class MisPeliculas implements OnInit {
  private readonly compras = inject(ComprasService);
  private readonly resenas = inject(ResenasService);
  private readonly cargaGlobal = inject(CargaGlobalService);
  private readonly fb = inject(FormBuilder);

  readonly usuarioId = input("");

  protected readonly estrellasMaximas = ESTRELLAS_MAXIMAS;
  protected readonly largoMaximoComentario = LARGO_MAXIMO_COMENTARIO;
  protected readonly peliculas = signal<PeliculaVista[] | null>(null);
  protected readonly errorCarga = signal<string | null>(null);
  protected readonly enResena = signal<PeliculaVista | null>(null);
  protected readonly intentoEnviar = signal(false);
  protected readonly errorEnvio = signal<string | null>(null);

  protected readonly formulario = this.fb.group({
    estrellas: [0, Validators.min(1)],
    comentario: ["", Validators.maxLength(LARGO_MAXIMO_COMENTARIO)],
  });

  ngOnInit(): void {
    void this.cargar();
  }

  protected fechaVista(pelicula: PeliculaVista): string {
    return formatearFechaEstreno(fechaIsoLocal(new Date(pelicula.ultimaFuncion)));
  }

  protected abrirResena(pelicula: PeliculaVista): void {
    this.enResena.set(pelicula);
    this.intentoEnviar.set(false);
    this.errorEnvio.set(null);
    this.formulario.reset({ estrellas: pelicula.estrellas ?? 0, comentario: pelicula.comentario ?? "" });
  }

  protected cerrarResena(): void {
    this.enResena.set(null);
  }

  protected elegirEstrellas(estrellas: number): void {
    this.formulario.controls.estrellas.setValue(estrellas);
  }

  protected faltanEstrellas(): boolean {
    return this.formulario.controls.estrellas.invalid && this.intentoEnviar();
  }

  protected async guardarResena(): Promise<void> {
    this.intentoEnviar.set(true);
    this.errorEnvio.set(null);
    const pelicula = this.enResena();
    const usuarioId = this.usuarioId();
    if (this.formulario.invalid || !pelicula || !usuarioId) return;

    const estrellas = this.formulario.value.estrellas ?? 0;
    const comentario = (this.formulario.value.comentario ?? "").trim() || null;

    try {
      await this.cargaGlobal.envolver(() => this.resenas.guardar(usuarioId, pelicula.id, estrellas, comentario));
      this.peliculas.update((lista) =>
        (lista ?? []).map((item) => (item.id === pelicula.id ? { ...item, estrellas, comentario } : item)),
      );
      this.enResena.set(null);
    } catch {
      this.errorEnvio.set("No se pudo guardar tu reseña. Intentá de nuevo.");
    }
  }

  private async cargar(): Promise<void> {
    const usuarioId = this.usuarioId();
    if (!usuarioId) return;
    try {
      const peliculas = await this.cargaGlobal.envolver(() => this.compras.obtenerPeliculasVistas(usuarioId));
      this.peliculas.set(peliculas);
    } catch {
      this.errorCarga.set("No se pudieron cargar tus películas.");
    }
  }
}
