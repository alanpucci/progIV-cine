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
    disponible: true,
  },
  {
    ruta: 'funciones',
    titulo: 'Funciones',
    descripcion: 'Programación por sala y horario, sin solapamientos.',
    disponible: true,
  },
  {
    ruta: 'candy-bar',
    titulo: 'Candy bar',
    descripcion: 'Productos, categorías y combos.',
    disponible: true,
  },
  {
    ruta: 'cupones',
    titulo: 'Cupones',
    descripcion: 'Descuentos por porcentaje con vigencia.',
    disponible: true,
  },
  {
    ruta: 'recompensas',
    titulo: 'Recompensas',
    descripcion: 'Entradas y productos canjeables por puntos.',
    disponible: true,
  },
  {
    ruta: 'ventas',
    titulo: 'Ventas',
    descripcion: 'Compras confirmadas y cancelaciones con motivo.',
    disponible: true,
  },
  {
    ruta: 'reportes',
    titulo: 'Reportes',
    descripcion: 'Facturación diaria, entradas vendidas y estadísticas.',
    disponible: true,
  },
];
