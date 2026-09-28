import { NgModule } from '@angular/core';
import { CompraRoutingModule } from './compra-routing.module';
import { CarritoCompra } from './paginas/carrito-compra/carrito-compra';
import { CandyBar } from './paginas/candy-bar/candy-bar';
import { TarjetaCandy } from './componentes/tarjeta-candy/tarjeta-candy';
import { Boton } from '../../shared/componentes/boton/boton';

@NgModule({
  declarations: [CarritoCompra, CandyBar, TarjetaCandy],
  imports: [CompraRoutingModule, Boton],
})
export class CompraModule {}
