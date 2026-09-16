import { Routes } from '@angular/router';

export const RUTAS_COMPRA: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./paginas/compra-inicio/compra-inicio').then((m) => m.CompraInicio),
  },
];
