import { Pipe, PipeTransform } from "@angular/core";
import { PeliculaResumen } from "../../../core/modelos/pelicula.model";
import { normalizarTexto } from "../../../core/helpers/texto.helpers";

@Pipe({
  name: "filtrarPeliculas",
})
export class FiltrarPeliculas implements PipeTransform {
  transform(
    peliculas: PeliculaResumen[],
    termino: string,
    generos: ReadonlySet<string>,
  ): PeliculaResumen[] {
    const terminoNormalizado = normalizarTexto(termino);

    return peliculas.filter((pelicula) => {
      const coincideNombre =
        terminoNormalizado === "" || normalizarTexto(pelicula.nombre).includes(terminoNormalizado);
      const coincideGeneros =
        generos.size === 0 || pelicula.generos.some((genero) => generos.has(genero.id));
      return coincideNombre && coincideGeneros;
    });
  }
}
