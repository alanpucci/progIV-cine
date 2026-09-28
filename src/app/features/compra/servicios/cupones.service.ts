import { Service, inject } from '@angular/core';
import { SupabaseService } from '../../../core/servicios/supabase.service';
import { AuthService } from '../../../core/servicios/auth.service';
import { PerfilesService } from '../../../core/servicios/perfiles.service';
import { CuponAplicado } from '../modelos/cupon.model';
import { COLUMNAS_CUPON, estaVigente, mapearCuponAplicado } from '../helpers/cupon.mapeos';
import { calcularEdad } from '../helpers/edad.helpers';

@Service()
export class CuponesService {
  private readonly supabase = inject(SupabaseService).cliente;
  private readonly auth = inject(AuthService);
  private readonly perfiles = inject(PerfilesService);

  async validar(codigo: string): Promise<CuponAplicado> {
    const { data, error } = await this.supabase.from('cupones').select(COLUMNAS_CUPON).eq('codigo', codigo).maybeSingle();

    if (error) throw error;
    if (!data) throw new Error('El cupón ingresado no existe o no está disponible.');

    const cupon = mapearCuponAplicado(data);
    if (cupon.fechaInicio && new Date() < new Date(cupon.fechaInicio)) {
      throw new Error('Este cupón todavía no está vigente.');
    }
    if (!estaVigente(cupon)) throw new Error('Este cupón ya venció.');

    if (cupon.tipo === 'primera_compra') {
      const usuarioId = this.usuarioId();
      if (!usuarioId) {
        throw new Error('Este cupón es para la primera compra de una cuenta registrada. Iniciá sesión para usarlo.');
      }
      if (await this.tieneCompras(usuarioId)) throw new Error('Este cupón es solo para tu primera compra.');
    }

    if (cupon.tipo === 'edad') {
      const usuarioId = this.usuarioId();
      if (!usuarioId) throw new Error('Este cupón requiere validar tu edad. Iniciá sesión para usarlo.');
      if ((await this.obtenerEdad(usuarioId)) < (cupon.edadMinima ?? 0)) {
        throw new Error(`Este cupón es para mayores de ${cupon.edadMinima} años.`);
      }
    }

    return cupon;
  }

  async buscarCuponAutomatico(): Promise<CuponAplicado | null> {
    await this.auth.cargarSesion();
    const usuarioId = this.usuarioId();
    if (!usuarioId) return null;

    const [cupones, tieneCompras, edad] = await Promise.all([
      this.obtenerCuponesAutomaticos(),
      this.tieneCompras(usuarioId),
      this.obtenerEdad(usuarioId),
    ]);

    const aplicable = cupones.find(
      (cupon) =>
        estaVigente(cupon) && (cupon.tipo === 'primera_compra' ? !tieneCompras : edad >= (cupon.edadMinima ?? 0)),
    );
    return aplicable ?? null;
  }

  private usuarioId(): string | null {
    return this.auth.sesion()?.user.id ?? null;
  }

  private async obtenerCuponesAutomaticos(): Promise<CuponAplicado[]> {
    const { data, error } = await this.supabase
      .from('cupones')
      .select(COLUMNAS_CUPON)
      .in('tipo', ['primera_compra', 'edad'])
      .order('porcentaje', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(mapearCuponAplicado);
  }

  private async tieneCompras(usuarioId: string): Promise<boolean> {
    const { count, error } = await this.supabase
      .from('ventas')
      .select('id', { count: 'exact', head: true })
      .eq('usuario_id', usuarioId)
      .neq('estado', 'cancelada');

    if (error) throw error;
    return (count ?? 0) > 0;
  }

  private async obtenerEdad(usuarioId: string): Promise<number> {
    const perfil = await this.perfiles.obtener(usuarioId);
    return calcularEdad(perfil.fechaNacimiento);
  }
}
