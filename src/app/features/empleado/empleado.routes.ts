import { Routes } from '@angular/router';

export const RUTAS_EMPLEADO: Routes = [
  {
    path: '',
    loadComponent: () => import('./paginas/control-acceso/control-acceso').then((m) => m.ControlAcceso),
  },
];
