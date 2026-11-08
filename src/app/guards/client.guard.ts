import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';
import { AuthService } from '../service/auth.service';

export const clientGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.restoreSession().pipe(map((client) => {
    if (!client) return router.createUrlTree(['/login']);
    const role = client.role?.toUpperCase();
    if (role !== 'CLIENT' && role !== 'ADMIN' && role !== 'OPERATOR') {
      return router.createUrlTree(['/login']);
    }
    const id = route.paramMap.get('id');
    if (id && Number(id) !== client.id) return router.createUrlTree(['/login']);
    return true;
  }));
};
