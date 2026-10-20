import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth.service';

/** Bloquea rutas si no hay sesión; redirige a /login. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.sesionIniciada) {
    return true;
  }
  return router.createUrlTree(['/login']);
};
