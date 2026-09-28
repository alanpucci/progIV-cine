import { Service, inject, signal } from '@angular/core';
import { AuthError, Session } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { PerfilesService } from './perfiles.service';
import { DatosRegistro } from '../modelos/usuario.model';

const MENSAJES_ERROR_AUTH: Record<string, string> = {
  user_already_exists: 'Ya existe una cuenta registrada con ese mail.',
  email_exists: 'Ya existe una cuenta registrada con ese mail.',
  weak_password: 'La contraseña es demasiado débil. Probá con una más larga.',
  email_address_invalid: 'El mail ingresado no es válido.',
  over_request_rate_limit: 'Demasiados intentos seguidos. Esperá unos minutos y volvé a intentar.',
  signup_disabled: 'El registro de cuentas está deshabilitado temporalmente.',
  invalid_credentials: 'El mail o la contraseña no son correctos.',
  user_banned: 'Esta cuenta está suspendida. Contactá al cine.',
};

@Service()
export class AuthService {
  private readonly supabase = inject(SupabaseService).cliente;
  private readonly perfiles = inject(PerfilesService);

  readonly sesion = signal<Session | null>(null);

  constructor() {
    this.cargarSesion();
  }

  haySesion(): boolean {
    return this.sesion() !== null;
  }

  async cargarSesion(): Promise<void> {
    const { data } = await this.supabase.auth.getSession();
    this.sesion.set(data.session);
  }

  async registrar(datos: DatosRegistro): Promise<void> {
    const { data, error } = await this.supabase.auth.signUp({
      email: datos.email,
      password: datos.contrasena,
    });
    if (error || !data.user) throw new Error(this.traducirError(error, 'No se pudo completar el registro. Intentá de nuevo en unos minutos.'));
    await this.perfiles.crear(data.user.id, datos);
    this.sesion.set(data.session);
  }

  async iniciarSesion(email: string, contrasena: string): Promise<void> {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password: contrasena });
    if (error) throw new Error(this.traducirError(error, 'No se pudo iniciar sesión. Intentá de nuevo en unos minutos.'));
    this.sesion.set(data.session);
  }

  async cerrarSesion(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw new Error(this.traducirError(error, 'No se pudo cerrar la sesión. Intentá de nuevo.'));
    this.sesion.set(null);
  }

  private traducirError(error: AuthError | null, mensajePorDefecto: string): string {
    return (error?.code && MENSAJES_ERROR_AUTH[error.code]) || mensajePorDefecto;
  }
}
