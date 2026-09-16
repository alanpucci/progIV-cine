import { Routes } from '@angular/router';

export const RUTAS_PERFIL: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./paginas/perfil-inicio/perfil-inicio').then((m) => m.PerfilInicio),
  },
];
