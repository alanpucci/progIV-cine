import { Service, inject } from '@angular/core';
import { SupabaseService } from '../../../core/servicios/supabase.service';
import { Butaca } from '../../../core/modelos/funcion.model';
import { mapearButaca } from '../../../core/helpers/funcion.mapeos';
import { ButacaDeseada, DatosSala, SalaAdministracion } from '../modelos/sala-administracion.model';
import {
  COLUMNAS_SALA_ADMINISTRACION,
  mapearSalaAdministracion,
  planificarCambiosButacas,
} from '../helpers/sala-administracion.mapeos';

const CODIGO_REGISTRO_DUPLICADO = '23505';
const CODIGO_REFERENCIA_EXISTENTE = '23503';
const MENSAJE_SALA_DUPLICADA = 'Ya existe una sala con ese nombre.';
const MENSAJE_SALA_CON_FUNCIONES =
  'La sala tiene funciones cargadas, así que no se puede eliminar. Podés desactivarla.';

@Service()
export class SalasAdministracionService {
  private readonly supabase = inject(SupabaseService).cliente;

  async obtenerListado(): Promise<SalaAdministracion[]> {
    const { data, error } = await this.supabase.from('salas').select(COLUMNAS_SALA_ADMINISTRACION).order('nombre');

    if (error) throw error;
    return (data ?? []).map(mapearSalaAdministracion);
  }

  async obtenerPorId(id: string): Promise<SalaAdministracion | null> {
    const { data, error } = await this.supabase
      .from('salas')
      .select(COLUMNAS_SALA_ADMINISTRACION)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data ? mapearSalaAdministracion(data) : null;
  }

  async obtenerButacas(salaId: string): Promise<Butaca[]> {
    const { data, error } = await this.supabase
      .from('butacas')
      .select('id, sala_id, fila, numero, tipo, precio_adicional, activa')
      .eq('sala_id', salaId);

    if (error) throw error;
    return (data ?? []).map(mapearButaca);
  }

  async crear(datos: DatosSala): Promise<void> {
    const { data, error } = await this.supabase
      .from('salas')
      .insert({ nombre: datos.nombre, activa: datos.activa })
      .select('id')
      .single();

    if (error?.code === CODIGO_REGISTRO_DUPLICADO) throw new Error(MENSAJE_SALA_DUPLICADA);
    if (error) throw error;
    await this.insertarButacas(data.id, datos.butacas);
  }

  async actualizar(id: string, datos: DatosSala): Promise<void> {
    const { error } = await this.supabase
      .from('salas')
      .update({ nombre: datos.nombre, activa: datos.activa })
      .eq('id', id);

    if (error?.code === CODIGO_REGISTRO_DUPLICADO) throw new Error(MENSAJE_SALA_DUPLICADA);
    if (error) throw error;

    const { altas, cambios } = planificarCambiosButacas(await this.obtenerButacas(id), datos.butacas);
    await this.insertarButacas(id, altas);
    for (const cambio of cambios) {
      const { error: errorCambio } = await this.supabase
        .from('butacas')
        .update(cambio.valores)
        .eq('sala_id', id)
        .eq('fila', cambio.fila)
        .in('numero', cambio.numeros);
      if (errorCambio) throw errorCambio;
    }
  }

  async cambiarActivacion(id: string, activa: boolean): Promise<void> {
    const { error } = await this.supabase.from('salas').update({ activa }).eq('id', id);

    if (error) throw error;
  }

  async eliminar(id: string): Promise<void> {
    const { error } = await this.supabase.from('salas').delete().eq('id', id);

    if (error?.code === CODIGO_REFERENCIA_EXISTENTE) throw new Error(MENSAJE_SALA_CON_FUNCIONES);
    if (error) throw error;
  }

  private async insertarButacas(salaId: string, butacas: ButacaDeseada[]): Promise<void> {
    if (butacas.length === 0) return;

    const { error } = await this.supabase.from('butacas').insert(
      butacas.map((butaca) => ({
        sala_id: salaId,
        fila: butaca.fila,
        numero: butaca.numero,
        tipo: butaca.tipo,
        precio_adicional: butaca.precioAdicional,
      })),
    );
    if (error) throw error;
  }
}
