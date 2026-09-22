import { Service, signal } from "@angular/core";
import { BehaviorSubject } from "rxjs";

@Service()
export class CargaGlobalService {
  private readonly contador = new BehaviorSubject(0);

  readonly visible = signal(false);

  constructor() {
    this.contador.subscribe((valor) => this.visible.set(valor > 0));
  }

  mostrar(): void {
    this.contador.next(this.contador.value + 1);
  }

  ocultar(): void {
    this.contador.next(Math.max(0, this.contador.value - 1));
  }

  async envolver<T>(tarea: () => Promise<T>): Promise<T> {
    this.mostrar();
    try {
      return await tarea();
    } finally {
      this.ocultar();
    }
  }
}
