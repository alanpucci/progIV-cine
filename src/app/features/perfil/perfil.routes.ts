import { Routes } from '@angular/router';

export const RUTAS_PERFIL: Routes = [
  {
    path: 'registro',
    loadComponent: () =>
      import('./paginas/registro-cuenta/registro-cuenta').then((m) => m.RegistroCuenta),
  },
];
