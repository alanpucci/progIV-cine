import { Routes } from '@angular/router';

export const RUTAS_PROXIMAMENTE: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./paginas/proximamente-inicio/proximamente-inicio').then((m) => m.ProximamenteInicio),
  },
];
