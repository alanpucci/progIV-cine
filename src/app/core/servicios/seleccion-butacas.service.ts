import { Service, signal } from '@angular/core';
import { Butaca, ButacaElegida, FuncionMapa, SeleccionButacas } from '../modelos/funcion.model';

const CLAVE_ALMACENAMIENTO = 'cine.seleccion-butacas';

@Service()
export class SeleccionButacasService {
  readonly seleccion = signal<SeleccionButacas | null>(this.leerAlmacenada());

  confirmar(funcion: FuncionMapa, butacas: Butaca[]): void {
    const elegidas: ButacaElegida[] = butacas
      .map((butaca) => ({
        id: butaca.id,
        fila: butaca.fila,
        numero: butaca.numero,
        tipo: butaca.tipo,
        precio: Number(funcion.precioBase) + Number(butaca.precioAdicional),
      }))
      .sort((butacaA, butacaB) => butacaA.fila.localeCompare(butacaB.fila, 'es') || butacaA.numero - butacaB.numero);

    this.actualizar({ funcion, butacas: elegidas });
  }

  limpiar(): void {
    this.actualizar(null);
  }

  idsElegidosPara(funcionId: string): string[] {
    const seleccion = this.seleccion();
    return seleccion?.funcion.id === funcionId ? seleccion.butacas.map((butaca) => butaca.id) : [];
  }

  total(): number {
    return (this.seleccion()?.butacas ?? []).reduce((suma, butaca) => suma + butaca.precio, 0);
  }

  private actualizar(seleccion: SeleccionButacas | null): void {
    this.seleccion.set(seleccion);
    try {
      if (seleccion) {
        sessionStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(seleccion));
      } else {
        sessionStorage.removeItem(CLAVE_ALMACENAMIENTO);
      }
    } catch {
      return;
    }
  }

  private leerAlmacenada(): SeleccionButacas | null {
    try {
      const guardada = sessionStorage.getItem(CLAVE_ALMACENAMIENTO);
      return guardada ? (JSON.parse(guardada) as SeleccionButacas) : null;
    } catch {
      return null;
    }
  }
}
