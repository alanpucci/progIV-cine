import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdministracionInicio } from './paginas/administracion-inicio/administracion-inicio';
import { RUTAS_ADMINISTRACION } from './administracion.routes';

/**
 * Feature con NgModule clásico (a diferencia del resto de las features, que
 * son standalone). Ver README.md para la justificación de por qué esta
 * feature en particular usa este patrón.
 */
@NgModule({
  declarations: [AdministracionInicio],
  imports: [CommonModule, RouterModule.forChild(RUTAS_ADMINISTRACION)],
})
export class AdministracionModule {}
