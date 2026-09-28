import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function fechaIsoLocal(fecha: Date): string {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

export const FECHA_NACIMIENTO_MINIMA = '1900-01-01';

export const fechaNacimientoValida: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const valor: string = control.value;
  if (!valor) return null;
  if (valor > fechaIsoLocal(new Date())) return { fechaFutura: true };
  if (valor < FECHA_NACIMIENTO_MINIMA) return { fechaImprobable: true };
  return null;
};

export const sinEspaciosVacios: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  typeof control.value === 'string' && control.value.length > 0 && control.value.trim().length === 0
    ? { soloEspacios: true }
    : null;

export function contrasenasCoinciden(campoContrasena: string, campoConfirmacion: string): ValidatorFn {
  return (grupo: AbstractControl): ValidationErrors | null => {
    const contrasena = grupo.get(campoContrasena)?.value;
    const confirmacion = grupo.get(campoConfirmacion)?.value;
    return confirmacion && contrasena !== confirmacion ? { contrasenasDistintas: true } : null;
  };
}
