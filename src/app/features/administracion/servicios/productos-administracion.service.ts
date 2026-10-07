import { Service, inject } from '@angular/core';
import { SupabaseService } from '../../../core/servicios/supabase.service';
import { DatosProducto, ProductoAdministracion } from '../modelos/candy-bar-administracion.model';
import {
  COLUMNAS_PRODUCTO_ADMINISTRACION,
  filaDesdeDatosProducto,
  mapearProductoAdministracion,
} from '../helpers/candy-bar-administracion.mapeos';

const CODIGO_REFERENCIA_EXISTENTE = '23503';
const MENSAJE_PRODUCTO_EN_USO =
  'El producto forma parte de un combo o ya se vendió, así que no se puede eliminar. Podés desactivarlo.';

@Service()
export class ProductosAdministracionService {
  private readonly supabase = inject(SupabaseService).cliente;

  async obtenerListado(): Promise<ProductoAdministracion[]> {
    const { data, error } = await this.supabase
      .from('productos')
      .select(COLUMNAS_PRODUCTO_ADMINISTRACION)
      .order('nombre');

    if (error) throw error;
    return (data ?? []).map(mapearProductoAdministracion);
  }

  async obtenerPorId(id: string): Promise<ProductoAdministracion | null> {
    const { data, error } = await this.supabase
      .from('productos')
      .select(COLUMNAS_PRODUCTO_ADMINISTRACION)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data ? mapearProductoAdministracion(data) : null;
  }

  async crear(datos: DatosProducto): Promise<void> {
    const { error } = await this.supabase.from('productos').insert(filaDesdeDatosProducto(datos));

    if (error) throw error;
  }

  async actualizar(id: string, datos: DatosProducto): Promise<void> {
    const { error } = await this.supabase.from('productos').update(filaDesdeDatosProducto(datos)).eq('id', id);

    if (error) throw error;
  }

  async cambiarActivacion(id: string, activo: boolean): Promise<void> {
    const { error } = await this.supabase.from('productos').update({ activo }).eq('id', id);

    if (error) throw error;
  }

  async eliminar(id: string): Promise<void> {
    const { error } = await this.supabase.from('productos').delete().eq('id', id);

    if (error?.code === CODIGO_REFERENCIA_EXISTENTE) throw new Error(MENSAJE_PRODUCTO_EN_USO);
    if (error) throw error;
  }
}
