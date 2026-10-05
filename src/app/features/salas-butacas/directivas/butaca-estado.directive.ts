import { Directive, input } from "@angular/core";
import { TipoButaca } from "../../../core/modelos/funcion.model";

@Directive({
  selector: "[appButaca]",
  host: {
    "[attr.data-tipo]": "tipo()",
    "[attr.aria-pressed]": "seleccionada()",
    "[attr.data-vendida]": "vendida()",
  },
})
export class ButacaEstado {
  readonly tipo = input<TipoButaca>("normal", { alias: "appButaca" });
  readonly seleccionada = input(false);
  readonly vendida = input(false);
}
