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
    path: 'compra',
    loadChildren: () => import('./features/compra/compra.module').then((m) => m.CompraModule),
  },
  {
    path: 'mis-entradas',
    loadChildren: () => import('./features/entradas/entradas.routes').then((m) => m.RUTAS_ENTRADAS),
  },
  {
    path: 'cuenta',
    loadChildren: () => import('./features/perfil/perfil.routes').then((m) => m.RUTAS_PERFIL),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
