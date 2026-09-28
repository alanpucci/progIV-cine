import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CompraRoutingModule } from './compra-routing.module';
import { CarritoCompra } from './paginas/carrito-compra/carrito-compra';
import { CandyBar } from './paginas/candy-bar/candy-bar';
import { TarjetaCandy } from './componentes/tarjeta-candy/tarjeta-candy';
import { CuponCarrito } from './componentes/cupon-carrito/cupon-carrito';
import { Boton } from '../../shared/componentes/boton/boton';

@NgModule({
  declarations: [CarritoCompra, CandyBar, TarjetaCandy, CuponCarrito],
  imports: [CompraRoutingModule, ReactiveFormsModule, Boton],
})
export class CompraModule {}
