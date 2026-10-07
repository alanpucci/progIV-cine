import { fechaIsoLocal } from '../../shared/validadores/fecha.validadores';

export const DIAS_PREVENTA = 7;

export type EstadoVenta = 'proximamente' | 'preventa' | 'en-venta';

export interface DatosVentaPelicula {
  fechaEstreno: string;
  preventaHabilitada: boolean;
  precioPreventa: number | null;
}

function desplazarDias(fecha: string, dias: number): string {
  const resultado = new Date(`${fecha}T00:00:00`);
  resultado.setDate(resultado.getDate() + dias);
  return fechaIsoLocal(resultado);
}

export function hoyLocal(): string {
  return fechaIsoLocal(new Date());
}

export function inicioPreventa(fechaEstreno: string): string {
  return desplazarDias(fechaEstreno, -DIAS_PREVENTA);
}

export function ultimoEstrenoEnPreventa(): string {
  return desplazarDias(hoyLocal(), DIAS_PREVENTA);
}

export function estadoVenta(pelicula: DatosVentaPelicula): EstadoVenta {
  const hoy = hoyLocal();
  if (pelicula.fechaEstreno <= hoy) return 'en-venta';
  if (pelicula.preventaHabilitada && inicioPreventa(pelicula.fechaEstreno) <= hoy) return 'preventa';
  return 'proximamente';
}

export function aperturaDeVenta(pelicula: DatosVentaPelicula): string {
  return pelicula.preventaHabilitada ? inicioPreventa(pelicula.fechaEstreno) : pelicula.fechaEstreno;
}

export function precioEntrada(precioBase: number, pelicula: DatosVentaPelicula): number {
  return estadoVenta(pelicula) === 'preventa' && pelicula.precioPreventa !== null
    ? Number(pelicula.precioPreventa)
    : Number(precioBase);
}
