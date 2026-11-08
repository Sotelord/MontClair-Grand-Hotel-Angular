import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../service/auth.service';

export const operatorGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.restoreSession().pipe(map((client) => {
    const role = client?.role?.toUpperCase();
    return role === 'OPERATOR' || role === 'ADMIN'
      ? true
      : router.createUrlTree(['/login']);
  }));
};
