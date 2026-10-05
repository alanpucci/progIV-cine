import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CompraRoutingModule } from './compra-routing.module';
import { CarritoCompra } from './paginas/carrito-compra/carrito-compra';
import { CandyBar } from './paginas/candy-bar/candy-bar';
import { TarjetaCandy } from './componentes/tarjeta-candy/tarjeta-candy';
import { CuponCarrito } from './componentes/cupon-carrito/cupon-carrito';
import { DatosComprador } from './paginas/datos-comprador/datos-comprador';
import { SaldosCompra } from './componentes/saldos-compra/saldos-compra';
import { Pago } from './paginas/pago/pago';
import { Confirmacion } from './paginas/confirmacion/confirmacion';
import { TicketEntrada } from './componentes/ticket-entrada/ticket-entrada';
import { Boton } from '../../shared/componentes/boton/boton';
import { CodigoQr } from '../../shared/componentes/codigo-qr/codigo-qr';

@NgModule({
  declarations: [CarritoCompra, CandyBar, TarjetaCandy, CuponCarrito, DatosComprador, SaldosCompra, Pago, Confirmacion, TicketEntrada],
  imports: [CompraRoutingModule, ReactiveFormsModule, Boton, CodigoQr],
})
export class CompraModule {}
