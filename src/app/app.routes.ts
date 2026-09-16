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
    loadChildren: () => import('./features/compra/compra.routes').then((m) => m.RUTAS_COMPRA),
  },
  {
    path: 'fidelizacion',
    loadChildren: () =>
      import('./features/fidelizacion/fidelizacion.routes').then((m) => m.RUTAS_FIDELIZACION),
  },
  {
    path: 'entradas',
    loadChildren: () => import('./features/entradas/entradas.routes').then((m) => m.RUTAS_ENTRADAS),
  },
  {
    path: 'cancelaciones',
    loadChildren: () =>
      import('./features/cancelaciones/cancelaciones.routes').then((m) => m.RUTAS_CANCELACIONES),
  },
  {
    path: 'proximamente',
    loadChildren: () =>
      import('./features/proximamente/proximamente.routes').then((m) => m.RUTAS_PROXIMAMENTE),
  },
  {
    path: 'perfil',
    loadChildren: () => import('./features/perfil/perfil.routes').then((m) => m.RUTAS_PERFIL),
  },
  {
    path: 'empleado',
    loadChildren: () => import('./features/empleado/empleado.routes').then((m) => m.RUTAS_EMPLEADO),
  },
  {
    path: 'administracion',
    loadChildren: () =>
      import('./features/administracion/administracion.routes').then((m) => m.RUTAS_ADMINISTRACION),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
