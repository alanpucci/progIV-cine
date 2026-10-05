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
