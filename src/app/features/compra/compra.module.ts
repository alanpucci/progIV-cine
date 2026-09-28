import { NgModule } from '@angular/core';
import { CompraRoutingModule } from './compra-routing.module';
import { CarritoCompra } from './paginas/carrito-compra/carrito-compra';
import { Boton } from '../../shared/componentes/boton/boton';

@NgModule({
  declarations: [CarritoCompra],
  imports: [CompraRoutingModule, Boton],
})
export class CompraModule {}
