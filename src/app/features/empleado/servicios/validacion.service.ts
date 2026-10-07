import { Service, inject } from '@angular/core';
import { SupabaseService } from '../../../core/servicios/supabase.service';
import { EntradaEscaneada, NuevoUsoQr, UsoQr } from '../modelos/validacion.model';
import {
  COLUMNAS_ENTRADA_ESCANEADA,
  COLUMNAS_USO_QR,
  FilaEntradaEscaneada,
  FilaUsoQr,
  aEntradaEscaneada,
  aUsoQr,
} from '../helpers/validacion.mapeos';

@Service()
export class ValidacionService {
  private readonly supabase = inject(SupabaseService).cliente;

  async buscarEntrada(codigoQr: string): Promise<EntradaEscaneada | null> {
    const { data, error } = await this.supabase
      .from('entradas')
      .select(COLUMNAS_ENTRADA_ESCANEADA)
      .eq('codigo_qr', codigoQr)
      .maybeSingle();
    if (error) throw error;
    return data ? aEntradaEscaneada(data as FilaEntradaEscaneada) : null;
  }

  async validarEntrada(entradaId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('entradas')
      .update({ estado: 'validada', validada_at: new Date().toISOString() })
      .eq('id', entradaId)
      .eq('estado', 'emitida')
      .select('id');
    if (error) throw error;
    return data.length > 0;
  }

  async entregarCandy(ventaId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('ventas')
      .update({ candy_entregado_at: new Date().toISOString() })
      .eq('id', ventaId)
      .eq('estado', 'pagada')
      .is('candy_entregado_at', null)
      .select('id');
    if (error) throw error;
    return data.length > 0;
  }

  async registrarUso(empleadoId: string, uso: NuevoUsoQr): Promise<void> {
    const { error } = await this.supabase.from('usos_qr').insert({
      codigo_qr: uso.codigoQr,
      entrada_id: uso.entradaId,
      tipo: uso.concepto,
      empleado_id: empleadoId,
      resultado: uso.resultado,
    });
    if (error) throw error;
  }

  async obtenerHistorial(empleadoId: string, desde: string): Promise<UsoQr[]> {
    const { data, error } = await this.supabase
      .from('usos_qr')
      .select(COLUMNAS_USO_QR)
      .eq('empleado_id', empleadoId)
      .gte('created_at', desde)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data as FilaUsoQr[]).map(aUsoQr);
  }
}
