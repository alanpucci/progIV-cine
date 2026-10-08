import { Service, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { Compra, PeliculaVista } from '../modelos/compra.model';
import {
  COLUMNAS_COMPRA,
  COLUMNAS_PELICULA_VISTA,
  FilaCompra,
  FilaPeliculaVista,
  mapearCompra,
  mapearPeliculasVistas,
} from '../helpers/compra.mapeos';

const LIMITE_HISTORIAL = 50;

@Service()
export class ComprasService {
  private readonly supabase = inject(SupabaseService).cliente;

  async obtenerComprasPropias(usuarioId: string): Promise<Compra[]> {
    const { data, error } = await this.supabase
      .from('ventas')
      .select(COLUMNAS_COMPRA)
      .eq('usuario_id', usuarioId)
      .neq('estado', 'pendiente')
      .order('created_at', { ascending: false })
      .limit(LIMITE_HISTORIAL);
    if (error) throw error;
    return (data as FilaCompra[]).map(mapearCompra);
  }

  async cancelarCompra(ventaId: string): Promise<void> {
    const { error } = await this.supabase
      .from('ventas')
      .update({ estado: 'cancelada', cancelled_at: new Date().toISOString() })
      .eq('id', ventaId);
    if (error) throw error;
  }

  async obtenerPeliculasVistas(usuarioId: string): Promise<PeliculaVista[]> {
    const [entradas, calificaciones] = await Promise.all([
      this.supabase
        .from('venta_items')
        .select(COLUMNAS_PELICULA_VISTA)
        .eq('tipo_item', 'entrada')
        .eq('cancelado', false)
        .eq('ventas.usuario_id', usuarioId)
        .eq('ventas.estado', 'pagada')
        .lt('funciones.inicio', new Date().toISOString()),
      this.supabase.from('resenas').select('pelicula_id, estrellas, comentario').eq('usuario_id', usuarioId),
    ]);
    if (entradas.error) throw entradas.error;
    if (calificaciones.error) throw calificaciones.error;
    return mapearPeliculasVistas(entradas.data as FilaPeliculaVista[], calificaciones.data);
  }
}
