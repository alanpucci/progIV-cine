import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../servicios/auth.service';

function guardDeRol(permitido: (auth: AuthService) => boolean): CanMatchFn {
  return async () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    await auth.cargarSesion();
    if (permitido(auth)) return true;
    return router.createUrlTree([auth.haySesion() ? '/' : '/cuenta/ingreso']);
  };
}

export const adminGuard = guardDeRol((auth) => auth.esAdmin());
export const personalGuard = guardDeRol((auth) => auth.esPersonal());
export const noPersonalGuard = guardDeRol((auth) => !auth.esPersonal());
