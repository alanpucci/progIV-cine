export interface CategoriaAdministracion {
  id: string;
  nombre: string;
  cantidadProductos: number;
}

export interface ProductoAdministracion {
  id: string;
  categoriaId: string;
  categoriaNombre: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number | null;
  activo: boolean;
}

export type DatosProducto = Omit<ProductoAdministracion, 'id' | 'categoriaNombre'>;

export interface ItemCombo {
  productoId: string;
  cantidad: number;
}

export interface ItemComboAdministracion extends ItemCombo {
  productoNombre: string;
  productoPrecio: number;
}

export interface ComboAdministracion {
  id: string;
  nombre: string;
  descripcion: string;
  precioFijo: number;
  destacado: boolean;
  activo: boolean;
  items: ItemComboAdministracion[];
}

export type DatosCombo = Omit<ComboAdministracion, 'id' | 'items'> & { items: ItemCombo[] };
