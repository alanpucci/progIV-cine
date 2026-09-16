import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CompraInicio } from './paginas/compra-inicio/compra-inicio';
import { RUTAS_COMPRA } from './compra.routes';

/**
 * Feature con NgModule clásico (a diferencia del resto de las features, que
 * son standalone). Ver README.md para la justificación de por qué esta
 * feature en particular usa este patrón.
 */
@NgModule({
  declarations: [CompraInicio],
  imports: [CommonModule, RouterModule.forChild(RUTAS_COMPRA)],
})
export class CompraModule {}
