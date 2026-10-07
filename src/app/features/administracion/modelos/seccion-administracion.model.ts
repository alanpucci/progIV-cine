export interface SeccionAdministracion {
  ruta: string;
  titulo: string;
  descripcion: string;
  disponible: boolean;
}

export const SECCIONES_ADMINISTRACION: SeccionAdministracion[] = [
  {
    ruta: 'peliculas',
    titulo: 'Películas',
    descripcion: 'Cartelera, géneros, clasificación y preventa.',
    disponible: true,
  },
  {
    ruta: 'salas',
    titulo: 'Salas y butacas',
    descripcion: 'Distribución de filas y columnas, butacas accesibles y VIP.',
    disponible: false,
  },
  {
    ruta: 'funciones',
    titulo: 'Funciones',
    descripcion: 'Programación por sala y horario, sin solapamientos.',
    disponible: false,
  },
  {
    ruta: 'candy-bar',
    titulo: 'Candy bar',
    descripcion: 'Productos, categorías y combos.',
    disponible: false,
  },
  {
    ruta: 'cupones',
    titulo: 'Cupones',
    descripcion: 'Descuentos por porcentaje con vigencia.',
    disponible: false,
  },
];
