import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AdministracionRoutingModule } from './administracion-routing.module';
import { PanelAdministracion } from './paginas/panel-administracion/panel-administracion';
import { InicioAdministracion } from './paginas/inicio-administracion/inicio-administracion';
import { ListadoPeliculas } from './paginas/listado-peliculas/listado-peliculas';
import { FormularioPelicula } from './paginas/formulario-pelicula/formulario-pelicula';
import { GenerosPeliculas } from './paginas/generos-peliculas/generos-peliculas';
import { Boton } from '../../shared/componentes/boton/boton';

@NgModule({
  declarations: [PanelAdministracion, InicioAdministracion, ListadoPeliculas, FormularioPelicula, GenerosPeliculas],
  imports: [AdministracionRoutingModule, ReactiveFormsModule, Boton],
})
export class AdministracionModule {}
