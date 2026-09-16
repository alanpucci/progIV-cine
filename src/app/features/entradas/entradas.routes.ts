import { Routes } from '@angular/router';

export const RUTAS_ENTRADAS: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./paginas/entradas-inicio/entradas-inicio').then((m) => m.EntradasInicio),
  },
];
