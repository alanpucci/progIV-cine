import { Service, inject } from '@angular/core';
import { SupabaseService } from '../../../core/servicios/supabase.service';
import { FuncionConEntradas } from '../modelos/entrada-usuario.model';
import { COLUMNAS_ENTRADA_USUARIO, FilaEntradaUsuario, agruparPorFuncion } from '../helpers/entradas.mapeos';

@Service()
export class EntradasService {
  private readonly supabase = inject(SupabaseService).cliente;

  async obtenerEntradasPropias(usuarioId: string): Promise<FuncionConEntradas[]> {
    const { data, error } = await this.supabase
      .from('entradas')
      .select(COLUMNAS_ENTRADA_USUARIO)
      .eq('venta_items.ventas.usuario_id', usuarioId)
      .neq('venta_items.ventas.estado', 'pendiente');
    if (error) throw error;
    return agruparPorFuncion(data as FilaEntradaUsuario[]);
  }
}
