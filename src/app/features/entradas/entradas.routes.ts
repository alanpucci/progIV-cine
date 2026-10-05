import { Routes } from '@angular/router';
import { conSesionGuard } from '../../core/guardias/sesion.guard';

export const RUTAS_ENTRADAS: Routes = [
  {
    path: '',
    canActivate: [conSesionGuard],
    loadComponent: () => import('./paginas/mis-entradas/mis-entradas').then((m) => m.MisEntradas),
  },
];
