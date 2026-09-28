import { Service, inject } from '@angular/core';
import { SupabaseService } from '../../../core/servicios/supabase.service';
import { CartaCandy, CategoriaProducto, ComboCandy, ProductoCandy } from '../modelos/candy-bar.model';
import { mapearComboCandy, mapearProductoCandy } from '../helpers/candy-bar.mapeos';

@Service()
export class CandyBarService {
  private readonly supabase = inject(SupabaseService).cliente;

  async obtenerCarta(): Promise<CartaCandy> {
    const [categorias, productos, combos] = await Promise.all([
      this.obtenerCategorias(),
      this.obtenerProductos(),
      this.obtenerCombos(),
    ]);
    return { categorias, productos, combos };
  }

  private async obtenerCategorias(): Promise<CategoriaProducto[]> {
    const { data, error } = await this.supabase
      .from('categorias_producto')
      .select('id, nombre')
      .order('nombre', { ascending: true });

    if (error) throw error;
    return data ?? [];
  }

  private async obtenerProductos(): Promise<ProductoCandy[]> {
    const { data, error } = await this.supabase
      .from('productos')
      .select('id, categoria_id, nombre, descripcion, precio, stock')
      .eq('activo', true)
      .order('nombre', { ascending: true });

    if (error) throw error;
    return (data ?? []).map(mapearProductoCandy);
  }

  private async obtenerCombos(): Promise<ComboCandy[]> {
    const { data, error } = await this.supabase
      .from('combos')
      .select('id, nombre, descripcion, precio_fijo, destacado')
      .eq('activo', true)
      .order('destacado', { ascending: false })
      .order('nombre', { ascending: true });

    if (error) throw error;
    return (data ?? []).map(mapearComboCandy);
  }
}
