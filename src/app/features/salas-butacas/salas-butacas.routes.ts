import { Routes } from '@angular/router';

export const RUTAS_SALAS_BUTACAS: Routes = [
  {
    path: 'funcion/:id',
    loadComponent: () =>
      import('./paginas/butacas-inicio/butacas-inicio').then((m) => m.ButacasInicio),
  },
  {
    path: 'funcion/:id/resumen',
    loadComponent: () =>
      import('./paginas/resumen-seleccion/resumen-seleccion').then((m) => m.ResumenSeleccion),
  },
];
