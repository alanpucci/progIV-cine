import { Routes } from '@angular/router';

export const RUTAS_ADMINISTRACION: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./paginas/administracion-inicio/administracion-inicio').then((m) => m.AdministracionInicio),
  },
];
