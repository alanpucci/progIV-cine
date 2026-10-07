import { Routes } from '@angular/router';
import { adminGuard, noPersonalGuard, personalGuard } from './core/guardias/rol.guard';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/catalogo/catalogo.routes').then((m) => m.RUTAS_CATALOGO),
  },
  {
    path: 'proximamente',
    canMatch: [noPersonalGuard],
    loadChildren: () =>
      import('./features/proximamente/proximamente.routes').then((m) => m.RUTAS_PROXIMAMENTE),
  },
  {
    path: 'butacas',
    canMatch: [noPersonalGuard],
    loadChildren: () =>
      import('./features/salas-butacas/salas-butacas.routes').then((m) => m.RUTAS_SALAS_BUTACAS),
  },
  {
    path: 'compra',
    canMatch: [noPersonalGuard],
    loadChildren: () => import('./features/compra/compra.module').then((m) => m.CompraModule),
  },
  {
    path: 'mis-entradas',
    canMatch: [noPersonalGuard],
    loadChildren: () => import('./features/entradas/entradas.routes').then((m) => m.RUTAS_ENTRADAS),
  },
  {
    path: 'cuenta',
    loadChildren: () => import('./features/perfil/perfil.routes').then((m) => m.RUTAS_PERFIL),
  },
  {
    path: 'empleado',
    canMatch: [personalGuard],
    loadChildren: () => import('./features/empleado/empleado.routes').then((m) => m.RUTAS_EMPLEADO),
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
