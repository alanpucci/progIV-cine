import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PanelAdministracion } from './paginas/panel-administracion/panel-administracion';
import { InicioAdministracion } from './paginas/inicio-administracion/inicio-administracion';
import { ListadoPeliculas } from './paginas/listado-peliculas/listado-peliculas';
import { FormularioPelicula } from './paginas/formulario-pelicula/formulario-pelicula';
import { GenerosPeliculas } from './paginas/generos-peliculas/generos-peliculas';

const RUTAS_ADMINISTRACION: Routes = [
  {
    path: '',
    component: PanelAdministracion,
    children: [
      { path: '', component: InicioAdministracion },
      { path: 'peliculas', component: ListadoPeliculas },
      { path: 'peliculas/nueva', component: FormularioPelicula },
      { path: 'peliculas/generos', component: GenerosPeliculas },
      { path: 'peliculas/:id', component: FormularioPelicula },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(RUTAS_ADMINISTRACION)],
  exports: [RouterModule],
})
export class AdministracionRoutingModule {}
