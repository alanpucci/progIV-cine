import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

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
