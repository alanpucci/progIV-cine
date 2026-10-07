import { Service, inject } from '@angular/core';
import { SupabaseService } from '../../../core/servicios/supabase.service';
import { VentaAdministracion } from '../modelos/venta-administracion.model';
import {
  COLUMNAS_VENTA_ADMINISTRACION,
  FilaVentaAdministracion,
  mapearVentaAdministracion,
} from '../helpers/venta-administracion.mapeos';

const LIMITE_LISTADO = 100;

@Service()
export class VentasAdministracionService {
  private readonly supabase = inject(SupabaseService).cliente;

  async obtenerListado(): Promise<VentaAdministracion[]> {
    const { data, error } = await this.supabase
      .from('ventas')
      .select(COLUMNAS_VENTA_ADMINISTRACION)
      .neq('estado', 'pendiente')
      .order('created_at', { ascending: false })
      .limit(LIMITE_LISTADO);

    if (error) throw error;
    return (data as FilaVentaAdministracion[]).map(mapearVentaAdministracion);
  }

  async cancelar(id: string, motivo: string): Promise<void> {
    const { error } = await this.supabase
      .from('ventas')
      .update({ estado: 'cancelada', cancelled_at: new Date().toISOString(), motivo_cancelacion: motivo })
      .eq('id', id);

    if (error) throw error;
  }
}
