import { Service, inject } from '@angular/core';
import { SupabaseService } from '../../../core/servicios/supabase.service';
import { CategoriaAdministracion } from '../modelos/candy-bar-administracion.model';
import {
  COLUMNAS_CATEGORIA_ADMINISTRACION,
  mapearCategoriaAdministracion,
} from '../helpers/candy-bar-administracion.mapeos';

const CODIGO_REGISTRO_DUPLICADO = '23505';
const CODIGO_REFERENCIA_EXISTENTE = '23503';
const MENSAJE_CATEGORIA_DUPLICADA = 'Ya existe una categoría con ese nombre.';
const MENSAJE_CATEGORIA_CON_PRODUCTOS =
  'La categoría tiene productos, así que no se puede eliminar. Mové o eliminá esos productos primero.';

@Service()
export class CategoriasProductoAdministracionService {
  private readonly supabase = inject(SupabaseService).cliente;

  async obtenerListado(): Promise<CategoriaAdministracion[]> {
    const { data, error } = await this.supabase
      .from('categorias_producto')
      .select(COLUMNAS_CATEGORIA_ADMINISTRACION)
      .order('nombre');

    if (error) throw error;
    return (data ?? []).map(mapearCategoriaAdministracion);
  }

  async crear(nombre: string): Promise<void> {
    const { error } = await this.supabase.from('categorias_producto').insert({ nombre });

    if (error?.code === CODIGO_REGISTRO_DUPLICADO) throw new Error(MENSAJE_CATEGORIA_DUPLICADA);
    if (error) throw error;
  }

  async renombrar(id: string, nombre: string): Promise<void> {
    const { error } = await this.supabase.from('categorias_producto').update({ nombre }).eq('id', id);

    if (error?.code === CODIGO_REGISTRO_DUPLICADO) throw new Error(MENSAJE_CATEGORIA_DUPLICADA);
    if (error) throw error;
  }

  async eliminar(id: string): Promise<void> {
    const { error } = await this.supabase.from('categorias_producto').delete().eq('id', id);

    if (error?.code === CODIGO_REFERENCIA_EXISTENTE) throw new Error(MENSAJE_CATEGORIA_CON_PRODUCTOS);
    if (error) throw error;
  }
}
