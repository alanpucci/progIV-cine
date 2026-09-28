import { Service, inject } from '@angular/core';
import { AuthError } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';
import { DatosRegistro, ResultadoRegistro } from '../modelos/usuario.model';

const MENSAJES_ERROR_AUTH: Record<string, string> = {
  user_already_exists: 'Ya existe una cuenta registrada con ese mail.',
  email_exists: 'Ya existe una cuenta registrada con ese mail.',
  weak_password: 'La contraseña es demasiado débil. Probá con una más larga.',
  email_address_invalid: 'El mail ingresado no es válido.',
  over_email_send_rate_limit: 'Se enviaron demasiados mails de confirmación. Esperá unos minutos y volvé a intentar.',
  over_request_rate_limit: 'Demasiados intentos seguidos. Esperá unos minutos y volvé a intentar.',
  signup_disabled: 'El registro de cuentas está deshabilitado temporalmente.',
};

@Service()
export class AuthService {
  private readonly supabase = inject(SupabaseService).cliente;

  async registrar(datos: DatosRegistro): Promise<ResultadoRegistro> {
    const { data, error } = await this.supabase.auth.signUp({
      email: datos.email,
      password: datos.contrasena,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          nombre: datos.nombre,
          apellido: datos.apellido,
          fecha_nacimiento: datos.fechaNacimiento,
          tipo_sangre: datos.tipoSangre,
          color_ojos: datos.colorOjos,
          dias_vacaciones_anuales: datos.diasVacacionesAnuales,
        },
      },
    });

    if (error) throw new Error(this.traducirError(error));
    if (data.user?.identities?.length === 0) throw new Error(MENSAJES_ERROR_AUTH['user_already_exists']);

    return data.session ? 'sesion-iniciada' : 'confirmacion-pendiente';
  }

  private traducirError(error: AuthError): string {
    return (error.code && MENSAJES_ERROR_AUTH[error.code]) || 'No se pudo completar el registro. Intentá de nuevo en unos minutos.';
  }
}
