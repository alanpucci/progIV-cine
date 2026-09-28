import { ColorOjos, DatosPerfil, TipoSangre } from '../modelos/usuario.model';

export interface FilaPerfil {
  nombre: string;
  apellido: string;
  fecha_nacimiento: string;
  tipo_sangre: string | null;
  color_ojos: string | null;
  dias_vacaciones_anuales: number | null;
}

export const COLUMNAS_PERFIL = 'nombre, apellido, fecha_nacimiento, tipo_sangre, color_ojos, dias_vacaciones_anuales';

export function mapearPerfil(fila: FilaPerfil): DatosPerfil {
  return {
    nombre: fila.nombre,
    apellido: fila.apellido,
    fechaNacimiento: fila.fecha_nacimiento,
    tipoSangre: fila.tipo_sangre as TipoSangre,
    colorOjos: fila.color_ojos as ColorOjos,
    diasVacacionesAnuales: fila.dias_vacaciones_anuales ?? 0,
  };
}

export function aFilaPerfil(datos: DatosPerfil): FilaPerfil {
  return {
    nombre: datos.nombre,
    apellido: datos.apellido,
    fecha_nacimiento: datos.fechaNacimiento,
    tipo_sangre: datos.tipoSangre,
    color_ojos: datos.colorOjos,
    dias_vacaciones_anuales: datos.diasVacacionesAnuales,
  };
}
