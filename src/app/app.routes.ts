import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/catalogo/catalogo.routes').then((m) => m.RUTAS_CATALOGO),
  },
  {
    path: 'butacas',
    loadChildren: () =>
      import('./features/salas-butacas/salas-butacas.routes').then((m) => m.RUTAS_SALAS_BUTACAS),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
