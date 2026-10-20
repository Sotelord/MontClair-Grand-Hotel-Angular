import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const session = authService.getSession();

  if (session && session.role?.toUpperCase() === 'ADMIN') {
    return true;
  }

  if (session && session.id) {
    return router.createUrlTree(['/profile', session.id]);
  }

  return router.createUrlTree(['/login']);
};

