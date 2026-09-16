import { Routes } from '@angular/router';

export const RUTAS_EMPLEADO: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./paginas/empleado-inicio/empleado-inicio').then((m) => m.EmpleadoInicio),
  },
];
