import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const PATRON_NUMERO_TARJETA = /^\d{4} \d{4} \d{4} \d{4}$/;
export const PATRON_VENCIMIENTO = /^(0[1-9]|1[0-2])\/\d{2}$/;
export const PATRON_CVV = /^\d{3,4}$/;
export const FINAL_TARJETA_RECHAZADA = '0000';

const DIGITOS_TARJETA = 16;
const DIGITOS_POR_GRUPO = 4;
const DIGITOS_VENCIMIENTO = 4;
const DIGITOS_MES = 2;

export const vencimientoVigente: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const valor: string = control.value ?? '';
  if (!PATRON_VENCIMIENTO.test(valor)) return null;
  const [mes, anio] = valor.split('/').map(Number);
  const finDeMes = new Date(2000 + anio, mes, 1);
  return finDeMes <= new Date() ? { tarjetaVencida: true } : null;
};

function soloDigitos(valor: string, maximo: number): string {
  return valor.replace(/\D/g, '').slice(0, maximo);
}

export function formatoNumeroTarjeta(valor: string, insertando: boolean): string {
  const digitos = soloDigitos(valor, DIGITOS_TARJETA);
  const grupos = digitos.match(new RegExp(`.{1,${DIGITOS_POR_GRUPO}}`, 'g')) ?? [];
  const grupoCompleto = digitos.length > 0 && digitos.length % DIGITOS_POR_GRUPO === 0;
  const separador = insertando && grupoCompleto && digitos.length < DIGITOS_TARJETA ? ' ' : '';
  return grupos.join(' ') + separador;
}

export function formatoVencimiento(valor: string, insertando: boolean): string {
  const digitos = soloDigitos(valor, DIGITOS_VENCIMIENTO);
  if (digitos.length > DIGITOS_MES) return `${digitos.slice(0, DIGITOS_MES)}/${digitos.slice(DIGITOS_MES)}`;
  return insertando && digitos.length === DIGITOS_MES ? `${digitos}/` : digitos;
}

function ultimosDigitos(numero: string): string {
  return numero.replace(/\s/g, '').slice(-4);
}

export function simularAutorizacion(numero: string): string | null {
  const finales = ultimosDigitos(numero);
  if (finales === FINAL_TARJETA_RECHAZADA) return null;
  return `SIM-${finales}-${Date.now().toString(36).toUpperCase()}`;
}
