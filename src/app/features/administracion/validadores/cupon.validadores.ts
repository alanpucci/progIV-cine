import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export const edadMinimaRequerida: ValidatorFn = (grupo: AbstractControl): ValidationErrors | null => {
  const tipo = grupo.get('tipo')?.value;
  const edad = grupo.get('edadMinima')?.value;
  return tipo === 'edad' && (edad === null || edad === '') ? { edadMinimaRequerida: true } : null;
};

export const vigenciaOrdenada: ValidatorFn = (grupo: AbstractControl): ValidationErrors | null => {
  const inicio: string = grupo.get('fechaInicio')?.value;
  const fin: string = grupo.get('fechaFin')?.value;
  return inicio && fin && fin < inicio ? { vigenciaDesordenada: true } : null;
};
