import { Service, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { DatosPerfil } from '../modelos/usuario.model';
import { COLUMNAS_PERFIL, aFilaPerfil, mapearPerfil } from '../helpers/perfil.mapeos';

@Service()
export class PerfilesService {
  private readonly supabase = inject(SupabaseService).cliente;

  async crear(usuarioId: string, datos: DatosPerfil): Promise<void> {
    const { error } = await this.supabase.from('perfiles').insert({ id: usuarioId, ...aFilaPerfil(datos) });
    if (error) throw error;
  }

  async obtener(usuarioId: string): Promise<DatosPerfil> {
    const { data, error } = await this.supabase
      .from('perfiles')
      .select(COLUMNAS_PERFIL)
      .eq('id', usuarioId)
      .single();
    if (error) throw error;
    return mapearPerfil(data);
  }

  async actualizar(usuarioId: string, datos: DatosPerfil): Promise<void> {
    const { error } = await this.supabase.from('perfiles').update(aFilaPerfil(datos)).eq('id', usuarioId);
    if (error) throw error;
  }
}
