export type TipoRecompensa = 'entrada' | 'producto';

export interface Recompensa {
  id: string;
  tipo: TipoRecompensa;
  productoId: string | null;
  nombre: string;
  puntosCosto: number;
}
