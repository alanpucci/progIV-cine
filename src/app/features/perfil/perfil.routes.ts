import { Routes } from '@angular/router';
import { conSesionGuard, sinSesionGuard } from '../../core/guardias/sesion.guard';

export const RUTAS_PERFIL: Routes = [
  {
    path: 'registro',
    canActivate: [sinSesionGuard],
    loadComponent: () =>
      import('./paginas/registro-cuenta/registro-cuenta').then((m) => m.RegistroCuenta),
  },
  {
    path: 'ingreso',
    canActivate: [sinSesionGuard],
    loadComponent: () =>
      import('./paginas/ingreso-cuenta/ingreso-cuenta').then((m) => m.IngresoCuenta),
  },
  {
    path: 'perfil',
    canActivate: [conSesionGuard],
    loadComponent: () =>
      import('./paginas/perfil-cuenta/perfil-cuenta').then((m) => m.PerfilCuenta),
  },
];
