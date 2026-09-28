import { Directive, input } from "@angular/core";

@Directive({
  selector: "[appButacaSeleccionada]",
  host: {
    "[attr.aria-pressed]": "seleccionada()",
  },
})
export class ButacaSeleccionada {
  readonly seleccionada = input(false, { alias: "appButacaSeleccionada" });
}
