import { Directive, signal } from "@angular/core";

@Directive({
  selector: "[appInteractiva]",
  host: {
    style: "cursor: pointer",
    "(mouseenter)": "elevada.set(true)",
    "(mouseleave)": "elevada.set(false)",
    "[style.transform]": "elevada() ? 'translateY(-4px)' : null",
    "[style.box-shadow]": "elevada() ? 'var(--sombra-elevada)' : null",
    "[style.border-color]": "elevada() ? 'var(--color-acento-secundario)' : null",
  },
})
export class Interactiva {
  readonly elevada = signal(false);
}
