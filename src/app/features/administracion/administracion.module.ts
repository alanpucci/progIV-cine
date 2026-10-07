import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdministracionRoutingModule } from './administracion-routing.module';
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
import { ListadoCupones } from './paginas/listado-cupones/listado-cupones';
import { FormularioCupon } from './paginas/formulario-cupon/formulario-cupon';
import { ListadoRecompensas } from './paginas/listado-recompensas/listado-recompensas';
import { FormularioRecompensa } from './paginas/formulario-recompensa/formulario-recompensa';
import { ListadoVentas } from './paginas/listado-ventas/listado-ventas';
import { Reportes } from './paginas/reportes/reportes';
import { GraficoBarras } from './componentes/grafico-barras/grafico-barras';
import { Boton } from '../../shared/componentes/boton/boton';

@NgModule({
  declarations: [
    PanelAdministracion,
    InicioAdministracion,
    ListadoPeliculas,
    FormularioPelicula,
    GenerosPeliculas,
    ListadoSalas,
    FormularioSala,
    ListadoFunciones,
    FormularioFuncion,
    ListadoCandyBar,
    FormularioProducto,
    FormularioCombo,
    CategoriasProducto,
    ListadoCupones,
    FormularioCupon,
    ListadoRecompensas,
    FormularioRecompensa,
    ListadoVentas,
    Reportes,
    GraficoBarras,
  ],
  imports: [AdministracionRoutingModule, FormsModule, ReactiveFormsModule, Boton],
})
export class AdministracionModule {}
