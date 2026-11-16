import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../service/auth.service';

// Personal del hotel: pasan ADMIN y OPERATOR
export const staffGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.restoreSession().pipe(
    map((client) => {
      const role = client?.role?.toUpperCase();
      if (role === 'ADMIN' || role === 'OPERATOR' || role === 'OPERARIO')
        return true;
      if (client) return router.createUrlTree(['/profile']);
      return router.createUrlTree(['/login']);
    }),
  );
};
