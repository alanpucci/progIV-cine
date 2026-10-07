import { Service, inject } from '@angular/core';
import { SupabaseService } from '../../../core/servicios/supabase.service';
import { AuthService } from '../../../core/servicios/auth.service';
import { DatosFuncion, FuncionAdministracion, OpcionPelicula, OpcionSala } from '../modelos/funcion-administracion.model';
import {
  COLUMNAS_FUNCION_ADMINISTRACION,
  MARGEN_ENTRE_FUNCIONES_MINUTOS,
  filaDesdeDatosFuncion,
  mapearFuncionAdministracion,
  sumarMinutos,
} from '../helpers/funcion-administracion.mapeos';

const CODIGO_REFERENCIA_EXISTENTE = '23503';
const MENSAJE_SALA_OCUPADA =
  'La sala ya tiene una función en ese horario (contando los 30 minutos de margen entre funciones).';
const MENSAJE_SIN_SALAS_LIBRES =
  'No hay ninguna sala activa libre en ese horario (contando los 30 minutos de margen entre funciones).';
const MENSAJE_FUNCION_CON_VENTAS = 'La función tiene entradas vendidas, así que no se puede eliminar.';

@Service()
export class FuncionesAdministracionService {
  private readonly supabase = inject(SupabaseService).cliente;
  private readonly auth = inject(AuthService);

  async obtenerListado(proximas: boolean): Promise<FuncionAdministracion[]> {
    const ahora = new Date().toISOString();
    const consulta = this.supabase
      .from('funciones')
      .select(COLUMNAS_FUNCION_ADMINISTRACION)
      .eq('venta_items.tipo_item', 'entrada')
      .eq('venta_items.cancelado', false);

    const { data, error } = proximas
      ? await consulta.gte('fin', ahora).order('inicio', { ascending: true })
      : await consulta.lt('fin', ahora).order('inicio', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(mapearFuncionAdministracion);
  }

  async obtenerPorId(id: string): Promise<FuncionAdministracion | null> {
    const { data, error } = await this.supabase
      .from('funciones')
      .select(COLUMNAS_FUNCION_ADMINISTRACION)
      .eq('venta_items.tipo_item', 'entrada')
      .eq('venta_items.cancelado', false)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data ? mapearFuncionAdministracion(data) : null;
  }

  async obtenerPeliculas(): Promise<OpcionPelicula[]> {
    const { data, error } = await this.supabase
      .from('peliculas')
      .select('id, nombre, duracion_minutos')
      .order('nombre');

    if (error) throw error;
    return (data ?? []).map((fila) => ({ id: fila.id, nombre: fila.nombre, duracionMinutos: fila.duracion_minutos }));
  }

  async obtenerSalasActivas(): Promise<OpcionSala[]> {
    const { data, error } = await this.supabase.from('salas').select('id, nombre').eq('activa', true).order('nombre');

    if (error) throw error;
    return data ?? [];
  }

  async crear(datos: DatosFuncion): Promise<void> {
    const salaId = await this.resolverSala(datos, null);
    const { error } = await this.supabase
      .from('funciones')
      .insert({ ...filaDesdeDatosFuncion(datos, salaId), created_by: this.auth.sesion()?.user.id });

    if (error) throw error;
  }

  async actualizar(id: string, datos: DatosFuncion): Promise<void> {
    const salaId = await this.resolverSala(datos, id);
    const { error } = await this.supabase.from('funciones').update(filaDesdeDatosFuncion(datos, salaId)).eq('id', id);

    if (error) throw error;
  }

  async eliminar(id: string): Promise<void> {
    const { error } = await this.supabase.from('funciones').delete().eq('id', id);

    if (error?.code === CODIGO_REFERENCIA_EXISTENTE) throw new Error(MENSAJE_FUNCION_CON_VENTAS);
    if (error) throw error;
  }

  private async resolverSala(datos: DatosFuncion, funcionIdExcluida: string | null): Promise<string> {
    const ocupadas = await this.obtenerSalasOcupadas(datos.inicio, datos.fin, funcionIdExcluida);

    if (datos.salaId) {
      if (ocupadas.includes(datos.salaId)) throw new Error(MENSAJE_SALA_OCUPADA);
      return datos.salaId;
    }

    const libre = (await this.obtenerSalasActivas()).find((sala) => !ocupadas.includes(sala.id));
    if (!libre) throw new Error(MENSAJE_SIN_SALAS_LIBRES);
    return libre.id;
  }

  private async obtenerSalasOcupadas(inicio: string, fin: string, funcionIdExcluida: string | null): Promise<string[]> {
    let consulta = this.supabase
      .from('funciones')
      .select('id, sala_id')
      .lt('inicio', sumarMinutos(fin, MARGEN_ENTRE_FUNCIONES_MINUTOS))
      .gt('fin', sumarMinutos(inicio, -MARGEN_ENTRE_FUNCIONES_MINUTOS));
    if (funcionIdExcluida) consulta = consulta.neq('id', funcionIdExcluida);

    const { data, error } = await consulta;
    if (error) throw error;
    return (data ?? []).map((funcion) => funcion.sala_id);
  }
}
