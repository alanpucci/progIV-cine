import { Relacion, unico } from '../../../core/helpers/relacion.helpers';
import {
  CategoriaAdministracion,
  ComboAdministracion,
  DatosCombo,
  DatosProducto,
  ProductoAdministracion,
} from '../modelos/candy-bar-administracion.model';

export const COLUMNAS_CATEGORIA_ADMINISTRACION = 'id, nombre, productos ( count )';

export const COLUMNAS_PRODUCTO_ADMINISTRACION =
  'id, categoria_id, nombre, descripcion, precio, stock, activo, categorias_producto ( nombre )';

export const COLUMNAS_COMBO_ADMINISTRACION = `
  id,
  nombre,
  descripcion,
  precio_fijo,
  destacado,
  activo,
  combo_items ( producto_id, cantidad, productos ( nombre, precio ) )
`;

export function mapearCategoriaAdministracion(fila: {
  id: string;
  nombre: string;
  productos: { count: number }[] | null;
}): CategoriaAdministracion {
  return { id: fila.id, nombre: fila.nombre, cantidadProductos: fila.productos?.[0]?.count ?? 0 };
}

export function mapearProductoAdministracion(fila: {
  id: string;
  categoria_id: string;
  nombre: string;
  descripcion: string | null;
  precio: number;
  stock: number | null;
  activo: boolean;
  categorias_producto: Relacion<{ nombre: string }>;
}): ProductoAdministracion {
  return {
    id: fila.id,
    categoriaId: fila.categoria_id,
    categoriaNombre: unico(fila.categorias_producto)?.nombre ?? '',
    nombre: fila.nombre,
    descripcion: fila.descripcion ?? '',
    precio: Number(fila.precio),
    stock: fila.stock,
    activo: fila.activo,
  };
}

export function filaDesdeDatosProducto(datos: DatosProducto) {
  return {
    categoria_id: datos.categoriaId,
    nombre: datos.nombre,
    descripcion: datos.descripcion || null,
    precio: datos.precio,
    stock: datos.stock,
    activo: datos.activo,
  };
}

export function mapearComboAdministracion(fila: {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio_fijo: number;
  destacado: boolean;
  activo: boolean;
  combo_items: { producto_id: string; cantidad: number; productos: Relacion<{ nombre: string; precio: number }> }[] | null;
}): ComboAdministracion {
  return {
    id: fila.id,
    nombre: fila.nombre,
    descripcion: fila.descripcion ?? '',
    precioFijo: Number(fila.precio_fijo),
    destacado: fila.destacado,
    activo: fila.activo,
    items: (fila.combo_items ?? []).map((item) => ({
      productoId: item.producto_id,
      cantidad: item.cantidad,
      productoNombre: unico(item.productos)?.nombre ?? '',
      productoPrecio: Number(unico(item.productos)?.precio ?? 0),
    })),
  };
}

export function filaDesdeDatosCombo(datos: DatosCombo) {
  return {
    nombre: datos.nombre,
    descripcion: datos.descripcion || null,
    precio_fijo: datos.precioFijo,
    destacado: datos.destacado,
    activo: datos.activo,
  };
}
