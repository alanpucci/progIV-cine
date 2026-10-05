export type Relacion<T> = T | T[] | null;

export function unico<T>(relacion: Relacion<T>): T | null {
  return Array.isArray(relacion) ? (relacion[0] ?? null) : relacion;
}
