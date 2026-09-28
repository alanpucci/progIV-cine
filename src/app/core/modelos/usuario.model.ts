export const TIPOS_SANGRE = ['0+', '0-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'] as const;
export const COLORES_OJOS = ['Marrón', 'Negro', 'Verde', 'Azul', 'Otro'] as const;

export type TipoSangre = (typeof TIPOS_SANGRE)[number];
export type ColorOjos = (typeof COLORES_OJOS)[number];

export interface DatosRegistro {
  email: string;
  contrasena: string;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  tipoSangre: TipoSangre;
  colorOjos: ColorOjos;
  diasVacacionesAnuales: number;
}

export type ResultadoRegistro = 'sesion-iniciada' | 'confirmacion-pendiente';
