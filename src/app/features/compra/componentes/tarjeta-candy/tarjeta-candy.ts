import { Component, input, output } from "@angular/core";

@Component({
  selector: "app-tarjeta-candy",
  standalone: false,
  styleUrl: "./tarjeta-candy.scss",
  templateUrl: "./tarjeta-candy.html",
})
export class TarjetaCandy {
  readonly nombre = input("");
  readonly descripcion = input("");
  readonly precio = input(0);
  readonly cantidad = input(0);
  readonly maximo = input<number | null>(null);
  readonly destacado = input(false);

  readonly sumar = output<void>();
  readonly restar = output<void>();

  protected agotado(): boolean {
    return this.maximo() === 0;
  }

  protected alcanzoMaximo(): boolean {
    const maximo = this.maximo();
    return maximo !== null && this.cantidad() >= maximo;
  }
}
