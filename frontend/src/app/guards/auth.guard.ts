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

export const logged: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.sesionIniciada) {
    return true;
  }
  return router.createUrlTree(['/dispositivos']);
};

/**
 * Bloquea rutas exclusivas de técnico.
 * Si el usuario tiene sesión pero no es técnico, redirige a /dispositivos.
 * Si no tiene sesión, primero lo manda a /login (via authGuard en cadena).
 */
export const tecnicoGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.esTecnico) {
    return true;
  }
  return router.createUrlTree(['/dispositivos']);
};
