import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../servicios/auth.service';

export const adminGuard: CanMatchFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  await auth.cargarSesion();
  if (auth.esAdmin()) return true;
  return router.createUrlTree([auth.haySesion() ? '/' : '/cuenta/ingreso']);
};
