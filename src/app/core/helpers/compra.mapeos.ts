import { Compra, EstadoVenta, ExtraCompra, PeliculaVista } from '../modelos/compra.model';

type Relacion<T> = T | T[] | null;

interface FilaFuncionCompra {
  inicio: string;
  peliculas: Relacion<{ id: string; nombre: string }>;
  salas: Relacion<{ nombre: string }>;
}

interface FilaItemCompra {
  id: string;
  tipo_item: string;
  cantidad: number;
  cancelado: boolean;
  funciones: Relacion<FilaFuncionCompra>;
  butacas: Relacion<{ fila: string; numero: number }>;
  productos: Relacion<{ nombre: string }>;
  combos: Relacion<{ nombre: string }>;
}

export interface FilaCompra {
  id: string;
  estado: string;
  total: number | string;
  created_at: string;
  venta_items: FilaItemCompra[] | null;
}

export interface FilaPeliculaVista {
  funciones: Relacion<{
    inicio: string;
    peliculas: Relacion<{ id: string; nombre: string; imagen_url: string }>;
  }>;
}

export interface FilaCalificacion {
  pelicula_id: string;
  estrellas: number;
}

export const COLUMNAS_COMPRA = `
  id,
  estado,
  total,
  created_at,
  venta_items (
    id,
    tipo_item,
    cantidad,
    cancelado,
    funciones ( inicio, peliculas ( id, nombre ), salas ( nombre ) ),
    butacas ( fila, numero ),
    productos ( nombre ),
    combos ( nombre )
  )
`;

export const COLUMNAS_PELICULA_VISTA = `
  funciones!inner ( inicio, peliculas!inner ( id, nombre, imagen_url ) ),
  ventas!inner ( usuario_id, estado )
`;

function unico<T>(relacion: Relacion<T>): T | null {
  return Array.isArray(relacion) ? (relacion[0] ?? null) : relacion;
}

function nombreExtra(item: FilaItemCompra): string {
  if (item.tipo_item === 'recompensa') return 'Recompensa canjeada';
  const nombre = unico(item.productos)?.nombre ?? unico(item.combos)?.nombre;
  return nombre ?? (item.tipo_item === 'combo' ? 'Combo' : 'Producto');
}

export function mapearCompra(fila: FilaCompra): Compra {
  const items = fila.venta_items ?? [];
  const entradas = items.filter((item) => item.tipo_item === 'entrada');
  const funcion = entradas.length > 0 ? unico(entradas[0].funciones) : null;
  const pelicula = funcion ? unico(funcion.peliculas) : null;

  const extras: ExtraCompra[] = items
    .filter((item) => item.tipo_item !== 'entrada')
    .map((item) => ({ nombre: nombreExtra(item), cantidad: item.cantidad }));

  return {
    id: fila.id,
    fecha: fila.created_at,
    estado: fila.estado as EstadoVenta,
    total: Number(fila.total),
    funcion: funcion
      ? {
          peliculaId: pelicula?.id ?? '',
          peliculaNombre: pelicula?.nombre ?? 'Película no disponible',
          salaNombre: unico(funcion.salas)?.nombre ?? '',
          inicio: funcion.inicio,
        }
      : null,
    butacas: entradas
      .map((item) => unico(item.butacas))
      .filter((butaca) => butaca !== null)
      .map((butaca) => `${butaca.fila}${butaca.numero}`),
    extras,
  };
}

export function mapearPeliculasVistas(
  filas: FilaPeliculaVista[],
  calificaciones: FilaCalificacion[],
): PeliculaVista[] {
  const porPelicula = new Map<string, PeliculaVista>();

  for (const fila of filas) {
    const funcion = unico(fila.funciones);
    const pelicula = funcion ? unico(funcion.peliculas) : null;
    if (!funcion || !pelicula) continue;

    const existente = porPelicula.get(pelicula.id);
    if (existente && existente.ultimaFuncion >= funcion.inicio) continue;

    porPelicula.set(pelicula.id, {
      id: pelicula.id,
      nombre: pelicula.nombre,
      imagenUrl: pelicula.imagen_url,
      ultimaFuncion: funcion.inicio,
      estrellas: calificaciones.find((c) => c.pelicula_id === pelicula.id)?.estrellas ?? null,
    });
  }

  return [...porPelicula.values()].sort((a, b) =>
    b.ultimaFuncion.localeCompare(a.ultimaFuncion),
  );
}
