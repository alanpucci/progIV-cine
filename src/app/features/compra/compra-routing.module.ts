import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CarritoCompra } from './paginas/carrito-compra/carrito-compra';

const RUTAS_COMPRA: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'carrito' },
  { path: 'carrito', component: CarritoCompra },
];

@NgModule({
  imports: [RouterModule.forChild(RUTAS_COMPRA)],
  exports: [RouterModule],
})
export class CompraRoutingModule {}
