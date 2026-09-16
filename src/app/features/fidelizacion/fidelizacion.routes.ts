import { Routes } from '@angular/router';

export const RUTAS_FIDELIZACION: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./paginas/fidelizacion-inicio/fidelizacion-inicio').then((m) => m.FidelizacionInicio),
  },
];
