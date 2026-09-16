import { Routes } from '@angular/router';

export const RUTAS_CANCELACIONES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./paginas/cancelaciones-inicio/cancelaciones-inicio').then((m) => m.CancelacionesInicio),
  },
];
