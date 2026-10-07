import { Component, OnInit, inject, signal } from "@angular/core";
import { AbstractControl, FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { CargaGlobalService } from "../../../../core/servicios/carga-global.service";
import { Butaca } from "../../../../core/modelos/funcion.model";
import { ButacaDeseada, EstadoCelda } from "../../modelos/sala-administracion.model";
import { SalasAdministracionService } from "../../servicios/salas-administracion.service";
import { claveButaca } from "../../helpers/sala-administracion.mapeos";
import { mensajeDeError } from "../../helpers/errores-administracion";
import { sinEspaciosVacios } from "../../../../shared/validadores/texto.validadores";

const MAXIMO_FILAS = 26;
const MAXIMO_COLUMNAS = 40;
const ENTERO_POSITIVO = /^\d+$/;
const CODIGO_LETRA_A = 65;

@Component({
  selector: "app-formulario-sala",
  standalone: false,
  styleUrl: "./formulario-sala.scss",
  templateUrl: "./formulario-sala.html",
})
export class FormularioSala implements OnInit {
  private readonly salasService = inject(SalasAdministracionService);
  protected readonly cargaGlobal = inject(CargaGlobalService);
  private readonly fb = inject(FormBuilder);
  private readonly ruta = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly maximoFilas = MAXIMO_FILAS;
  protected readonly maximoColumnas = MAXIMO_COLUMNAS;
  protected readonly pinceles: { estado: EstadoCelda; etiqueta: string }[] = [
    { estado: "normal", etiqueta: "Normal" },
    { estado: "accesible", etiqueta: "Accesible" },
    { estado: "vip", etiqueta: "VIP" },
    { estado: "pasillo", etiqueta: "Pasillo" },
  ];

  protected readonly salaId = signal("");
  protected readonly cantidadFunciones = signal(0);
  protected readonly noEncontrada = signal(false);
  protected readonly intentoEnviar = signal(false);
  protected readonly errorEnvio = signal<string | null>(null);
  protected readonly pincel = signal<EstadoCelda>("vip");
  protected readonly celdas = signal<Record<string, EstadoCelda>>({});

  protected readonly formulario = this.fb.group({
    nombre: ["", [Validators.required, sinEspaciosVacios]],
    activa: [true],
    filas: [
      10 as number | null,
      [Validators.required, Validators.min(1), Validators.max(MAXIMO_FILAS), Validators.pattern(ENTERO_POSITIVO)],
    ],
    columnas: [
      16 as number | null,
      [Validators.required, Validators.min(1), Validators.max(MAXIMO_COLUMNAS), Validators.pattern(ENTERO_POSITIVO)],
    ],
    adicionalVip: [0 as number | null, [Validators.required, Validators.min(0)]],
  });

  async ngOnInit(): Promise<void> {
    const id = this.ruta.snapshot.paramMap.get("id");
    if (!id) return;

    try {
      await this.cargaGlobal.envolver(() => this.cargarSala(id));
    } catch (error) {
      this.errorEnvio.set(mensajeDeError(error, "No se pudieron cargar los datos de la sala."));
    }
  }

  protected edicion(): boolean {
    return this.salaId() !== "";
  }

  protected mostrarError(control: AbstractControl): boolean {
    return control.invalid && (control.touched || this.intentoEnviar());
  }

  protected filasGrilla(): string[] {
    const cantidad = this.dimensionValida(this.formulario.controls.filas, MAXIMO_FILAS);
    return Array.from({ length: cantidad }, (_, indice) => String.fromCharCode(CODIGO_LETRA_A + indice));
  }

  protected numerosGrilla(): number[] {
    const cantidad = this.dimensionValida(this.formulario.controls.columnas, MAXIMO_COLUMNAS);
    return Array.from({ length: cantidad }, (_, indice) => indice + 1);
  }

  protected estadoCelda(fila: string, numero: number): EstadoCelda {
    return this.celdas()[claveButaca(fila, numero)] ?? "normal";
  }

  protected pintar(fila: string, numero: number): void {
    this.celdas.update((celdas) => ({ ...celdas, [claveButaca(fila, numero)]: this.pincel() }));
  }

  protected pintarFila(fila: string): void {
    const pintadas = Object.fromEntries(this.numerosGrilla().map((numero) => [claveButaca(fila, numero), this.pincel()]));
    this.celdas.update((celdas) => ({ ...celdas, ...pintadas }));
  }

  protected contar(estado: EstadoCelda): number {
    return this.butacasDeseadas().filter((butaca) => butaca.tipo === estado).length;
  }

  protected butacasDeseadas(): ButacaDeseada[] {
    const adicionalVip = Number(this.formulario.controls.adicionalVip.value ?? 0);
    const butacas: ButacaDeseada[] = [];
    for (const fila of this.filasGrilla()) {
      for (const numero of this.numerosGrilla()) {
        const estado = this.estadoCelda(fila, numero);
        if (estado === "pasillo") continue;
        butacas.push({ fila, numero, tipo: estado, precioAdicional: estado === "vip" ? adicionalVip : 0 });
      }
    }
    return butacas;
  }

  protected async guardar(): Promise<void> {
    this.intentoEnviar.set(true);
    this.errorEnvio.set(null);
    if (this.formulario.invalid) return;

    const butacas = this.butacasDeseadas();
    if (butacas.length === 0) {
      this.errorEnvio.set("La sala tiene que tener al menos una butaca.");
      return;
    }

    const valores = this.formulario.value;
    const datos = { nombre: (valores.nombre ?? "").trim(), activa: valores.activa ?? true, butacas };

    try {
      await this.cargaGlobal.envolver(() =>
        this.edicion() ? this.salasService.actualizar(this.salaId(), datos) : this.salasService.crear(datos),
      );
      this.router.navigate(["/administracion/salas"]);
    } catch (error) {
      this.errorEnvio.set(mensajeDeError(error, "No se pudo guardar la sala. Intentá de nuevo."));
    }
  }

  private dimensionValida(control: AbstractControl, maximo: number): number {
    return control.valid ? Math.min(Number(control.value), maximo) : 0;
  }

  private async cargarSala(id: string): Promise<void> {
    const [sala, butacas] = await Promise.all([
      this.salasService.obtenerPorId(id),
      this.salasService.obtenerButacas(id),
    ]);
    if (!sala) {
      this.noEncontrada.set(true);
      return;
    }

    const filas = Math.max(1, ...butacas.map((butaca) => butaca.fila.charCodeAt(0) - CODIGO_LETRA_A + 1));
    const columnas = Math.max(1, ...butacas.map((butaca) => butaca.numero));

    this.salaId.set(sala.id);
    this.cantidadFunciones.set(sala.cantidadFunciones);
    this.celdas.set(this.celdasDesdeButacas(butacas, filas, columnas));
    this.formulario.setValue({
      nombre: sala.nombre,
      activa: sala.activa,
      filas,
      columnas,
      adicionalVip: Number(butacas.find((butaca) => butaca.tipo === "vip")?.precioAdicional ?? 0),
    });
  }

  private celdasDesdeButacas(butacas: Butaca[], filas: number, columnas: number): Record<string, EstadoCelda> {
    const porClave = new Map(butacas.map((butaca) => [claveButaca(butaca.fila, butaca.numero), butaca]));
    const celdas: Record<string, EstadoCelda> = {};
    for (let indice = 0; indice < filas; indice++) {
      const fila = String.fromCharCode(CODIGO_LETRA_A + indice);
      for (let numero = 1; numero <= columnas; numero++) {
        const butaca = porClave.get(claveButaca(fila, numero));
        celdas[claveButaca(fila, numero)] = butaca?.activa ? butaca.tipo : "pasillo";
      }
    }
    return celdas;
  }
}
