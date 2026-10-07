import { Service, inject } from '@angular/core';
import { SupabaseService } from '../../../core/servicios/supabase.service';
import { ComboAdministracion, DatosCombo, ItemCombo } from '../modelos/candy-bar-administracion.model';
import {
  COLUMNAS_COMBO_ADMINISTRACION,
  filaDesdeDatosCombo,
  mapearComboAdministracion,
} from '../helpers/candy-bar-administracion.mapeos';

const CODIGO_REFERENCIA_EXISTENTE = '23503';
const MENSAJE_COMBO_VENDIDO = 'El combo ya se vendió, así que no se puede eliminar. Podés desactivarlo.';

@Service()
export class CombosAdministracionService {
  private readonly supabase = inject(SupabaseService).cliente;

  async obtenerListado(): Promise<ComboAdministracion[]> {
    const { data, error } = await this.supabase
      .from('combos')
      .select(COLUMNAS_COMBO_ADMINISTRACION)
      .order('destacado', { ascending: false })
      .order('nombre');

    if (error) throw error;
    return (data ?? []).map(mapearComboAdministracion);
  }

  async obtenerPorId(id: string): Promise<ComboAdministracion | null> {
    const { data, error } = await this.supabase
      .from('combos')
      .select(COLUMNAS_COMBO_ADMINISTRACION)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data ? mapearComboAdministracion(data) : null;
  }

  async crear(datos: DatosCombo): Promise<void> {
    const { data, error } = await this.supabase.from('combos').insert(filaDesdeDatosCombo(datos)).select('id').single();

    if (error) throw error;
    await this.reemplazarItems(data.id, datos.items);
  }

  async actualizar(id: string, datos: DatosCombo): Promise<void> {
    const { error } = await this.supabase.from('combos').update(filaDesdeDatosCombo(datos)).eq('id', id);

    if (error) throw error;
    await this.reemplazarItems(id, datos.items);
  }

  async cambiarActivacion(id: string, activo: boolean): Promise<void> {
    const { error } = await this.supabase.from('combos').update({ activo }).eq('id', id);

    if (error) throw error;
  }

  async eliminar(id: string): Promise<void> {
    const { error } = await this.supabase.from('combos').delete().eq('id', id);

    if (error?.code === CODIGO_REFERENCIA_EXISTENTE) throw new Error(MENSAJE_COMBO_VENDIDO);
    if (error) throw error;
  }

  private async reemplazarItems(comboId: string, items: ItemCombo[]): Promise<void> {
    const { error: errorBorrado } = await this.supabase.from('combo_items').delete().eq('combo_id', comboId);
    if (errorBorrado) throw errorBorrado;

    const { error } = await this.supabase
      .from('combo_items')
      .insert(items.map((item) => ({ combo_id: comboId, producto_id: item.productoId, cantidad: item.cantidad })));
    if (error) throw error;
  }
}
