import { NgModule } from '@angular/core';
import { AdministracionRoutingModule } from './administracion-routing.module';
import { PanelAdministracion } from './paginas/panel-administracion/panel-administracion';
import { InicioAdministracion } from './paginas/inicio-administracion/inicio-administracion';

@NgModule({
  declarations: [PanelAdministracion, InicioAdministracion],
  imports: [AdministracionRoutingModule],
})
export class AdministracionModule {}
