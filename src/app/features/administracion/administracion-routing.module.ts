import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PanelAdministracion } from './paginas/panel-administracion/panel-administracion';
import { InicioAdministracion } from './paginas/inicio-administracion/inicio-administracion';
import { ListadoPeliculas } from './paginas/listado-peliculas/listado-peliculas';
import { FormularioPelicula } from './paginas/formulario-pelicula/formulario-pelicula';
import { GenerosPeliculas } from './paginas/generos-peliculas/generos-peliculas';
import { ListadoSalas } from './paginas/listado-salas/listado-salas';
import { FormularioSala } from './paginas/formulario-sala/formulario-sala';
import { ListadoFunciones } from './paginas/listado-funciones/listado-funciones';
import { FormularioFuncion } from './paginas/formulario-funcion/formulario-funcion';
import { ListadoCandyBar } from './paginas/listado-candy-bar/listado-candy-bar';
import { FormularioProducto } from './paginas/formulario-producto/formulario-producto';
import { FormularioCombo } from './paginas/formulario-combo/formulario-combo';
import { CategoriasProducto } from './paginas/categorias-producto/categorias-producto';

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
      { path: 'salas', component: ListadoSalas },
      { path: 'salas/nueva', component: FormularioSala },
      { path: 'salas/:id', component: FormularioSala },
      { path: 'funciones', component: ListadoFunciones },
      { path: 'funciones/nueva', component: FormularioFuncion },
      { path: 'funciones/:id', component: FormularioFuncion },
      { path: 'candy-bar', component: ListadoCandyBar },
      { path: 'candy-bar/categorias', component: CategoriasProducto },
      { path: 'candy-bar/productos/nuevo', component: FormularioProducto },
      { path: 'candy-bar/productos/:id', component: FormularioProducto },
      { path: 'candy-bar/combos/nuevo', component: FormularioCombo },
      { path: 'candy-bar/combos/:id', component: FormularioCombo },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(RUTAS_ADMINISTRACION)],
  exports: [RouterModule],
})
export class AdministracionRoutingModule {}
