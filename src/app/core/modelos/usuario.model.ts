export const TIPOS_SANGRE = ['0+', '0-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'] as const;
export const COLORES_OJOS = ['Marrón', 'Negro', 'Verde', 'Azul', 'Otro'] as const;

export type TipoSangre = (typeof TIPOS_SANGRE)[number];
export type ColorOjos = (typeof COLORES_OJOS)[number];

export interface DatosPerfilNuevo {
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  tipoSangre: TipoSangre;
  colorOjos: ColorOjos;
  diasVacacionesAnuales: number;
}

export interface DatosRegistro extends DatosPerfilNuevo {
  email: string;
  contrasena: string;
}

export type ResultadoRegistro = 'sesion-iniciada' | 'confirmacion-pendiente';
