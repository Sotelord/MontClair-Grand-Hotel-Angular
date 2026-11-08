import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../service/auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.restoreSession().pipe(map((client) => {
    const role = client?.role?.toUpperCase();
    if (role === 'ADMIN') return true;
    if (role === 'OPERATOR' || role === 'OPERARIO') {
      return router.createUrlTree(['/operator/reservations']);
    }
    return router.createUrlTree(['/login']);
  }));
};
