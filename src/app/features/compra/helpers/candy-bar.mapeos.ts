import { ComboCandy, ProductoCandy } from '../modelos/candy-bar.model';

export function mapearProductoCandy(fila: {
  id: string;
  categoria_id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  stock: number | null;
}): ProductoCandy {
  return {
    id: fila.id,
    categoriaId: fila.categoria_id,
    nombre: fila.nombre,
    descripcion: fila.descripcion ?? '',
    precio: Number(fila.precio),
    stock: fila.stock,
  };
}

export function mapearComboCandy(fila: {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio_fijo: number;
  destacado: boolean;
}): ComboCandy {
  return {
    id: fila.id,
    nombre: fila.nombre,
    descripcion: fila.descripcion ?? '',
    precio: Number(fila.precio_fijo),
    destacado: fila.destacado,
  };
}
