import { Routes } from '@angular/router';

export const RUTAS_SALAS_BUTACAS: Routes = [
  {
    path: 'funcion/:id',
    loadComponent: () =>
      import('./paginas/butacas-inicio/butacas-inicio').then((m) => m.ButacasInicio),
  },
];
