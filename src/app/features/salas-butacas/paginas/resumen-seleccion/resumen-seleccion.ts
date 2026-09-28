import { Component, inject } from "@angular/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { SeleccionButacasService } from "../../../../core/servicios/seleccion-butacas.service";
import { SeleccionButacas } from "../../../../core/modelos/funcion.model";
import { Boton } from "../../../../shared/componentes/boton/boton";
import { formatearFechaFuncion, formatearHoraFuncion } from "../../../../core/helpers/pelicula.formato";

@Component({
  imports: [RouterLink, Boton],
  selector: "app-resumen-seleccion",
  styleUrl: "./resumen-seleccion.scss",
  templateUrl: "./resumen-seleccion.html",
})
export class ResumenSeleccion {
  private readonly ruta = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly seleccionButacas = inject(SeleccionButacasService);

  protected readonly formatearFechaFuncion = formatearFechaFuncion;
  protected readonly formatearHoraFuncion = formatearHoraFuncion;

  protected readonly funcionId = this.ruta.snapshot.paramMap.get("id")!;

  protected seleccion(): SeleccionButacas | null {
    const seleccion = this.seleccionButacas.seleccion();
    return seleccion?.funcion.id === this.funcionId && seleccion.butacas.length > 0 ? seleccion : null;
  }

  protected total(): number {
    return this.seleccionButacas.total();
  }

  protected cancelarSeleccion(): void {
    const peliculaId = this.seleccion()?.funcion.peliculaId;
    this.seleccionButacas.limpiar();
    this.router.navigate(peliculaId ? ["/pelicula", peliculaId] : ["/"]);
  }

  protected continuarAlCandyBar(): void {
    this.router.navigate(["/compra/candy-bar"]);
  }
}
