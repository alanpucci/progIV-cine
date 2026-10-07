import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PanelAdministracion } from './paginas/panel-administracion/panel-administracion';
import { InicioAdministracion } from './paginas/inicio-administracion/inicio-administracion';

const RUTAS_ADMINISTRACION: Routes = [
  {
    path: '',
    component: PanelAdministracion,
    children: [{ path: '', component: InicioAdministracion }],
  },
];

@NgModule({
  imports: [RouterModule.forChild(RUTAS_ADMINISTRACION)],
  exports: [RouterModule],
})
export class AdministracionRoutingModule {}
