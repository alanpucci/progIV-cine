import { Component, OnInit, inject, signal } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { CarritoService } from "../../servicios/carrito.service";
import { CargaGlobalService } from "../../../../core/servicios/carga-global.service";

@Component({
  selector: "app-cupon-carrito",
  standalone: false,
  styleUrl: "./cupon-carrito.scss",
  templateUrl: "./cupon-carrito.html",
})
export class CuponCarrito implements OnInit {
  private readonly cargaGlobal = inject(CargaGlobalService);
  private readonly fb = inject(FormBuilder);
  protected readonly carrito = inject(CarritoService);

  protected readonly error = signal("");

  protected readonly formulario = this.fb.group({
    codigo: ["", Validators.required],
  });

  async ngOnInit(): Promise<void> {
    try {
      await this.carrito.aplicarCuponAutomatico();
    } catch {
      return;
    }
  }

  protected async aplicar(): Promise<void> {
    this.error.set("");
    if (this.formulario.invalid) {
      this.error.set("Ingresá un código.");
      return;
    }

    try {
      await this.cargaGlobal.envolver(() => this.carrito.aplicarCupon(this.formulario.value.codigo ?? ""));
      this.formulario.reset();
    } catch (error) {
      this.error.set(error instanceof Error ? error.message : "No se pudo validar el cupón.");
    }
  }
}
