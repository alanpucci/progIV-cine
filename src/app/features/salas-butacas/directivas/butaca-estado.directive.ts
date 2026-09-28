import { Directive, input } from "@angular/core";
import { TipoButaca } from "../../../core/modelos/funcion.model";

@Directive({
  selector: "[appButaca]",
  host: {
    "[attr.data-tipo]": "tipo()",
    "[attr.aria-pressed]": "seleccionada()",
  },
})
export class ButacaEstado {
  readonly tipo = input<TipoButaca>("normal", { alias: "appButaca" });
  readonly seleccionada = input(false);
}
