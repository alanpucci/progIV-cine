import { AlertaEstreno, Notificacion } from '../modelos/alerta.model';
import { formatearFechaEstreno } from './pelicula.formato';
import { estadoVenta } from './preventa.helpers';

export const COLUMNAS_ALERTA = `
  id,
  pelicula_id,
  peliculas ( nombre, imagen_url, fecha_estreno, preventa_habilitada, precio_preventa )
`;

export const COLUMNAS_NOTIFICACION = 'id, tipo, titulo, mensaje, leida, pelicula_id, created_at';

interface PeliculaAlertada {
  nombre: string;
  imagen_url: string;
  fecha_estreno: string;
  preventa_habilitada: boolean;
  precio_preventa: number | null;
}

export interface FilaAlerta {
  id: string;
  pelicula_id: string;
  peliculas: PeliculaAlertada | PeliculaAlertada[] | null;
}

export interface FilaNotificacion {
  id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  pelicula_id: string | null;
  created_at: string;
}

export function mapearAlerta(fila: FilaAlerta): AlertaEstreno | null {
  const pelicula = Array.isArray(fila.peliculas) ? fila.peliculas[0] : fila.peliculas;
  if (!pelicula) return null;
  return {
    id: fila.id,
    peliculaId: fila.pelicula_id,
    nombre: pelicula.nombre,
    imagenUrl: pelicula.imagen_url,
    fechaEstreno: pelicula.fecha_estreno,
    preventaHabilitada: pelicula.preventa_habilitada,
    precioPreventa: pelicula.precio_preventa,
  };
}

export function mapearNotificacion(fila: FilaNotificacion): Notificacion {
  return {
    id: fila.id,
    tipo: fila.tipo,
    titulo: fila.titulo,
    mensaje: fila.mensaje,
    leida: fila.leida,
    peliculaId: fila.pelicula_id,
    creadaEn: fila.created_at,
  };
}

export function filaAvisoDeVenta(usuarioId: string, alerta: AlertaEstreno) {
  const enPreventa = estadoVenta(alerta) === 'preventa';
  return {
    usuario_id: usuarioId,
    pelicula_id: alerta.peliculaId,
    tipo: enPreventa ? 'preventa' : 'venta',
    titulo: enPreventa ? `Abrió la preventa de ${alerta.nombre}` : `${alerta.nombre} ya está en cartelera`,
    mensaje: enPreventa
      ? `Entradas a $${alerta.precioPreventa} hasta el estreno del ${formatearFechaEstreno(alerta.fechaEstreno)}.`
      : 'Las entradas ya están a la venta.',
  };
}
