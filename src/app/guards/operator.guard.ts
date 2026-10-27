import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';

export const operatorGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const session = authService.getSession();

  const role = session?.role?.toUpperCase();
  if (session && (role === 'OPERATOR' || role === 'OPERARIO')) {
    return true;
  }

  if (session && role === 'ADMIN') {
    return router.createUrlTree(['/admin/rooms']);
  }

  if (session && session.id) {
    return router.createUrlTree(['/profile', session.id]);
  }

  return router.createUrlTree(['/login']);
};

