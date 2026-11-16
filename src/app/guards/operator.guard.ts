import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../service/auth.service';

export const operatorGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.restoreSession().pipe(
    map((client) => {
      const role = client?.role?.toUpperCase();
      if (role === 'OPERATOR' || role === 'OPERARIO') return true;
      if (role === 'ADMIN') return router.createUrlTree(['/admin/rooms']);

      if (client) return router.createUrlTree(['/profile']);
      return router.createUrlTree(['/login']);
    }),
  );
};
