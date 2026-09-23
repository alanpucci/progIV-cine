import { Routes } from '@angular/router';

export const RUTAS_CATALOGO: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./paginas/catalogo-inicio/catalogo-inicio').then((m) => m.CatalogoInicio),
  },
  {
    path: 'pelicula/:id',
    loadComponent: () =>
      import('./paginas/pelicula-detalle/pelicula-detalle').then((m) => m.PeliculaDetallePagina),
  },
];
