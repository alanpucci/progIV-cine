import { Service, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { DatosPerfilNuevo } from '../modelos/usuario.model';

@Service()
export class PerfilesService {
  private readonly supabase = inject(SupabaseService).cliente;

  async crear(usuarioId: string, datos: DatosPerfilNuevo): Promise<void> {
    const { error } = await this.supabase.from('perfiles').insert({
      id: usuarioId,
      nombre: datos.nombre,
      apellido: datos.apellido,
      fecha_nacimiento: datos.fechaNacimiento,
      tipo_sangre: datos.tipoSangre,
      color_ojos: datos.colorOjos,
      dias_vacaciones_anuales: datos.diasVacacionesAnuales,
    });

    if (error) throw error;
  }
}
