import { Service, inject } from '@angular/core';
import { SupabaseService } from '../../../core/servicios/supabase.service';
import { CuponAdministracion, DatosCupon } from '../modelos/cupon-administracion.model';
import {
  COLUMNAS_CUPON_ADMINISTRACION,
  filaDesdeDatosCupon,
  mapearCuponAdministracion,
} from '../helpers/cupon-administracion.mapeos';

const CODIGO_REGISTRO_DUPLICADO = '23505';
const CODIGO_REFERENCIA_EXISTENTE = '23503';
const MENSAJE_CUPON_DUPLICADO = 'Ya existe un cupón con ese código.';
const MENSAJE_CUPON_USADO = 'El cupón ya se usó en alguna compra, así que no se puede eliminar. Podés desactivarlo.';

@Service()
export class CuponesAdministracionService {
  private readonly supabase = inject(SupabaseService).cliente;

  async obtenerListado(): Promise<CuponAdministracion[]> {
    const { data, error } = await this.supabase
      .from('cupones')
      .select(COLUMNAS_CUPON_ADMINISTRACION)
      .order('codigo');

    if (error) throw error;
    return (data ?? []).map(mapearCuponAdministracion);
  }

  async obtenerPorId(id: string): Promise<CuponAdministracion | null> {
    const { data, error } = await this.supabase
      .from('cupones')
      .select(COLUMNAS_CUPON_ADMINISTRACION)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data ? mapearCuponAdministracion(data) : null;
  }

  async crear(datos: DatosCupon): Promise<void> {
    const { error } = await this.supabase.from('cupones').insert(filaDesdeDatosCupon(datos));

    if (error?.code === CODIGO_REGISTRO_DUPLICADO) throw new Error(MENSAJE_CUPON_DUPLICADO);
    if (error) throw error;
  }

  async actualizar(id: string, datos: DatosCupon): Promise<void> {
    const { error } = await this.supabase.from('cupones').update(filaDesdeDatosCupon(datos)).eq('id', id);

    if (error?.code === CODIGO_REGISTRO_DUPLICADO) throw new Error(MENSAJE_CUPON_DUPLICADO);
    if (error) throw error;
  }

  async cambiarActivacion(id: string, activo: boolean): Promise<void> {
    const { error } = await this.supabase.from('cupones').update({ activo }).eq('id', id);

    if (error) throw error;
  }

  async eliminar(id: string): Promise<void> {
    const { error } = await this.supabase.from('cupones').delete().eq('id', id);

    if (error?.code === CODIGO_REFERENCIA_EXISTENTE) throw new Error(MENSAJE_CUPON_USADO);
    if (error) throw error;
  }
}
