import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const productoRequerido: ValidatorFn = (grupo: AbstractControl): ValidationErrors | null => {
  const tipo = grupo.get('tipo')?.value;
  const productoId = grupo.get('productoId')?.value;
  return tipo === 'producto' && !productoId ? { productoRequerido: true } : null;
};
