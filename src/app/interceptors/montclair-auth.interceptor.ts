import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../environments/environment';

const FALLBACK_ORIGIN = globalThis.location?.origin || 'http://localhost:4200';
const BACKEND_ORIGIN = new URL(environment.apiUrl, FALLBACK_ORIGIN).origin;
const TOKEN_KEY = 'token';

export function resetMontclairCsrfCache(): void {
  // CSRF desactivado en arquitectura Angular + JWT (patrón de Clase 15 Seguridad).
}

function isBackendRequest(url: string): boolean {
  if (url.startsWith('/api') || url.startsWith(environment.apiUrl)) {
    return true;
  }
  try {
    return (
      new URL(url, globalThis.location?.origin || FALLBACK_ORIGIN).origin ===
      BACKEND_ORIGIN
    );
  } catch {
    return url.startsWith(BACKEND_ORIGIN);
  }
}

export const montclairAuthInterceptor: HttpInterceptorFn = (request, next) => {
  if (!isBackendRequest(request.url)) {
    return next(request);
  }

  const jwt = localStorage.getItem(TOKEN_KEY);
  const intercepted = request.clone({
    withCredentials: true,
    ...(jwt ? { setHeaders: { Authorization: `Bearer ${jwt}` } } : {}),
  });

  return next(intercepted);
};
