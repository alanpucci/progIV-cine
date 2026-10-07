import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const sinEspaciosVacios: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
  typeof control.value === 'string' && control.value.length > 0 && control.value.trim().length === 0
    ? { soloEspacios: true }
    : null;
