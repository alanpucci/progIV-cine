import { Routes } from '@angular/router';
import { adminGuard, noAdminGuard } from './core/guardias/rol.guard';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/catalogo/catalogo.routes').then((m) => m.RUTAS_CATALOGO),
  },
  {
    path: 'butacas',
    canMatch: [noAdminGuard],
    loadChildren: () =>
      import('./features/salas-butacas/salas-butacas.routes').then((m) => m.RUTAS_SALAS_BUTACAS),
  },
  {
    path: 'compra',
    canMatch: [noAdminGuard],
    loadChildren: () => import('./features/compra/compra.module').then((m) => m.CompraModule),
  },
  {
    path: 'mis-entradas',
    canMatch: [noAdminGuard],
    loadChildren: () => import('./features/entradas/entradas.routes').then((m) => m.RUTAS_ENTRADAS),
  },
  {
    path: 'cuenta',
    loadChildren: () => import('./features/perfil/perfil.routes').then((m) => m.RUTAS_PERFIL),
  },
  {
    path: 'administracion',
    canMatch: [adminGuard],
    loadChildren: () =>
      import('./features/administracion/administracion.module').then((m) => m.AdministracionModule),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
