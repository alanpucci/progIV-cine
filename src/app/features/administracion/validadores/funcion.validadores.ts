import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const fechaHoraFutura: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const valor: string = control.value;
  return valor && new Date(valor) <= new Date() ? { fechaHoraPasada: true } : null;
};
