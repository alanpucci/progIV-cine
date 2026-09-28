import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../servicios/auth.service';

export const sinSesionGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.cargarSesion();
  if (!auth.haySesion()) return true;
  void router.navigate(['/'], { replaceUrl: true });
  return false;
};

export const conSesionGuard: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.cargarSesion();
  if (auth.haySesion()) return true;
  void router.navigate(['/cuenta/ingreso'], { replaceUrl: true });
  return false;
};
