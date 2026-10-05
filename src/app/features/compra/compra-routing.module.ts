import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CarritoCompra } from './paginas/carrito-compra/carrito-compra';
import { CandyBar } from './paginas/candy-bar/candy-bar';
import { DatosComprador } from './paginas/datos-comprador/datos-comprador';
import { Pago } from './paginas/pago/pago';

const RUTAS_COMPRA: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'carrito' },
  { path: 'candy-bar', component: CandyBar },
  { path: 'carrito', component: CarritoCompra },
  { path: 'datos-comprador', component: DatosComprador },
  { path: 'pago', component: Pago },
];

@NgModule({
  imports: [RouterModule.forChild(RUTAS_COMPRA)],
  exports: [RouterModule],
})
export class CompraRoutingModule {}
