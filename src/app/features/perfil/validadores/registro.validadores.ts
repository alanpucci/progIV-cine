import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function contrasenasCoinciden(campoContrasena: string, campoConfirmacion: string): ValidatorFn {
  return (grupo: AbstractControl): ValidationErrors | null => {
    const contrasena = grupo.get(campoContrasena)?.value;
    const confirmacion = grupo.get(campoConfirmacion)?.value;
    return confirmacion && contrasena !== confirmacion ? { contrasenasDistintas: true } : null;
  };
}
