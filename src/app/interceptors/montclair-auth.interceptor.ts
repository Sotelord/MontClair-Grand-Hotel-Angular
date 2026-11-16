import { HttpBackend, HttpClient, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, firstValueFrom, from, map, shareReplay, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';

const FALLBACK_ORIGIN = globalThis.location?.origin || 'http://localhost:4200';
const BACKEND_ORIGIN = new URL(environment.apiUrl, FALLBACK_ORIGIN).origin;
const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

let csrfToken: string | null = null;
let csrfRequest$: Observable<string> | null = null;

export function resetMontclairCsrfCache(): void {
  csrfToken = null;
  csrfRequest$ = null;
}

function isBackendRequest(url: string): boolean {
  if (url.startsWith('/api') || url.startsWith(environment.apiUrl)) {
    return true;
  }
  try {
    return new URL(url, globalThis.location?.origin || FALLBACK_ORIGIN).origin === BACKEND_ORIGIN;
  } catch {
    return url.startsWith(BACKEND_ORIGIN);
  }
}

export const montclairAuthInterceptor: HttpInterceptorFn = (request, next) => {
  if (!isBackendRequest(request.url)) {
    return next(request);
  }

  let intercepted = request.clone({ withCredentials: true });
  const method = request.method.toUpperCase();

  if (!MUTATING_METHODS.has(method)) {
    return next(intercepted);
  }

  if (csrfToken) {
    intercepted = intercepted.clone({
      setHeaders: { 'X-XSRF-TOKEN': csrfToken },
    });
    return next(intercepted);
  }

  if (!csrfRequest$) {
    const backend = inject(HttpBackend);
    const rawHttp = new HttpClient(backend);
    csrfRequest$ = rawHttp.get<unknown>(`${environment.apiUrl}/auth/csrf`, {
      withCredentials: true,
    }).pipe(
      map((response) => {
        if (typeof response === 'string') return response;
        const record = response as Record<string, unknown>;
        const token = record?.['token'] ?? record?.['csrfToken'] ?? record?.['value'];
        return typeof token === 'string' ? token : '';
      }),
      map((token) => {
        csrfToken = token || null;
        return token;
      }),
      catchError(() => {
        csrfToken = null;
        return [ '' ];
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
  }

  return from(firstValueFrom(csrfRequest$)).pipe(
    switchMap((token) => {
      if (token) {
        intercepted = intercepted.clone({
          setHeaders: { 'X-XSRF-TOKEN': token },
        });
      }
      return next(intercepted);
    }),
  );
};
