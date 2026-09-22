import { Component, inject } from "@angular/core";
import { CargaGlobalService } from "../../../core/servicios/carga-global.service";

@Component({
  imports: [],
  selector: "app-spinner-global",
  styleUrl: "./spinner-global.scss",
  templateUrl: "./spinner-global.html",
})
export class SpinnerGlobal {
  protected readonly cargaGlobal = inject(CargaGlobalService);
}
