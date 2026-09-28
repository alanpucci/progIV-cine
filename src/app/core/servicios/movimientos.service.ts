import { Service, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { MovimientoCredito, MovimientoPuntos, SaldosCuenta } from '../modelos/movimiento.model';
import {
  COLUMNAS_MOVIMIENTO_CREDITO,
  COLUMNAS_MOVIMIENTO_PUNTOS,
  COLUMNAS_SALDOS,
  mapearMovimientoCredito,
  mapearMovimientoPuntos,
  mapearSaldos,
} from '../helpers/movimiento.mapeos';

const LIMITE_HISTORIAL = 50;

@Service()
export class MovimientosService {
  private readonly supabase = inject(SupabaseService).cliente;

  async obtenerSaldos(usuarioId: string): Promise<SaldosCuenta> {
    const { data, error } = await this.supabase
      .from('perfiles')
      .select(COLUMNAS_SALDOS)
      .eq('id', usuarioId)
      .single();
    if (error) throw error;
    return mapearSaldos(data);
  }

  async obtenerMovimientosPuntos(usuarioId: string): Promise<MovimientoPuntos[]> {
    const { data, error } = await this.supabase
      .from('movimientos_puntos')
      .select(COLUMNAS_MOVIMIENTO_PUNTOS)
      .eq('usuario_id', usuarioId)
      .order('created_at', { ascending: false })
      .limit(LIMITE_HISTORIAL);
    if (error) throw error;
    return data.map(mapearMovimientoPuntos);
  }

  async obtenerMovimientosCredito(usuarioId: string): Promise<MovimientoCredito[]> {
    const { data, error } = await this.supabase
      .from('movimientos_credito')
      .select(COLUMNAS_MOVIMIENTO_CREDITO)
      .eq('usuario_id', usuarioId)
      .order('created_at', { ascending: false })
      .limit(LIMITE_HISTORIAL);
    if (error) throw error;
    return data.map(mapearMovimientoCredito);
  }
}
