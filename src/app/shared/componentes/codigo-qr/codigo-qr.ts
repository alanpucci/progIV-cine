import { Component, OnInit, input, signal } from "@angular/core";
import { generarQr } from "../../../core/helpers/qr.helpers";

@Component({
  selector: "app-codigo-qr",
  styleUrl: "./codigo-qr.scss",
  templateUrl: "./codigo-qr.html",
})
export class CodigoQr implements OnInit {
  readonly codigo = input("");

  protected readonly imagen = signal<string | null>(null);

  ngOnInit(): void {
    void this.generar();
  }

  private async generar(): Promise<void> {
    const codigo = this.codigo();
    if (!codigo) return;
    this.imagen.set(await generarQr(codigo));
  }
}
