import { Recompensa, TipoRecompensa } from '../modelos/recompensa.model';
import { Relacion, unico } from './relacion.helpers';

export interface FilaRecompensa {
  id: string;
  tipo: TipoRecompensa;
  producto_id: string | null;
  nombre: string;
  puntos_costo: number;
  productos: Relacion<{ activo: boolean }>;
}

export const COLUMNAS_RECOMPENSA = 'id, tipo, producto_id, nombre, puntos_costo, productos ( activo )';

export function recompensaDisponible(fila: FilaRecompensa): boolean {
  return fila.tipo === 'entrada' || unico(fila.productos)?.activo === true;
}

export function mapearRecompensa(fila: FilaRecompensa): Recompensa {
  return {
    id: fila.id,
    tipo: fila.tipo,
    productoId: fila.producto_id,
    nombre: fila.nombre,
    puntosCosto: fila.puntos_costo,
  };
}
