export interface AlertaEstreno {
  id: string;
  peliculaId: string;
  nombre: string;
  imagenUrl: string;
  fechaEstreno: string;
  preventaHabilitada: boolean;
  precioPreventa: number | null;
}

export interface Notificacion {
  id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  peliculaId: string | null;
  creadaEn: string;
}
