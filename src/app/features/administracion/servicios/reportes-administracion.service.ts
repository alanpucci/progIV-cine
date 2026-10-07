import { Service, inject } from '@angular/core';
import { SupabaseService } from '../../../core/servicios/supabase.service';
import { PeriodoReporte, Reporte } from '../modelos/reporte-administracion.model';
import { limitesDelPeriodo } from '../helpers/periodo-reporte.helpers';
import {
  COLUMNAS_VENTA_REPORTE,
  FilaVentaReporte,
  armarReporte,
} from '../helpers/reporte-administracion.mapeos';

@Service()
export class ReportesAdministracionService {
  private readonly supabase = inject(SupabaseService).cliente;

  async obtenerReporte(periodo: PeriodoReporte): Promise<Reporte> {
    const { desde, hastaExclusivo } = limitesDelPeriodo(periodo);
    const { data, error } = await this.supabase
      .from('ventas')
      .select(COLUMNAS_VENTA_REPORTE)
      .eq('estado', 'pagada')
      .gte('created_at', desde)
      .lt('created_at', hastaExclusivo);

    if (error) throw error;
    return armarReporte(data as FilaVentaReporte[], periodo);
  }
}
