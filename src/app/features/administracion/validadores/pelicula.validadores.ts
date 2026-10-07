import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const precioPreventaRequerido: ValidatorFn = (grupo: AbstractControl): ValidationErrors | null => {
  const habilitada = grupo.get('preventaHabilitada')?.value;
  const precio = grupo.get('precioPreventa')?.value;
  return habilitada && (precio === null || precio === '') ? { precioPreventaRequerido: true } : null;
};
