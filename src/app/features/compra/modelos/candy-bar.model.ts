export interface CategoriaProducto {
  id: string;
  nombre: string;
}

export interface ProductoCandy {
  id: string;
  categoriaId: string;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number | null;
}

export interface ComboCandy {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  destacado: boolean;
}

export interface CartaCandy {
  categorias: CategoriaProducto[];
  productos: ProductoCandy[];
  combos: ComboCandy[];
}
