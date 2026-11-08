import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, finalize, map, of, shareReplay, tap, throwError } from 'rxjs';
import { Client } from '../models/client.model';
import { resetMontclairCsrfCache } from '../interceptors/montclair-auth.interceptor';

//Respuesta del endpoint de login. `client` viene solo si el login fue exitoso; `message` trae el motivo si falló.
export interface LoginResponse {
  success: boolean;
  client?: Client;
  message?: string;
}

//Maneja la autenticación y la sesión del usuario. No usa tokens: la sesión es el objeto Client guardado en localStorage.
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/auth';
  private readonly storageKey = 'montclair_current_user';
  private currentUserSubject = new BehaviorSubject<Client | null>(this.readStoredUser());
  private restoredSession$?: Observable<Client | null>;

  readonly currentUser$ = this.currentUserSubject.asObservable();
  readonly isAuthenticated$ = this.currentUser$.pipe(map((client) => !!client));

  get currentUser(): Client | null {
    return this.currentUserSubject.value;
  }

  //Clave con la que se guarda el cliente en localStorage.
  private readonly SESSION_KEY = 'currentClient';

  /*Envía las credenciales al backend (POST /api/auth/login). Si el login es exitoso, guarda la sesión automáticamente con `tap`,
  sin alterar lo que recibe quien se suscriba.*/
  login(identifier: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, {
      identifier: identifier.trim(),
      password: password.trim(),
    }).pipe(tap((result) => {
      const client = result.client ?? this.profileFromResponse(result);
      if (result.success && client) {
        this.setCurrentUser(client);
      }
      resetMontclairCsrfCache();
    }));
  }

  saveSession(client: Client): void {
    this.setCurrentUser(client);
  }

  getSession(): Client | null {
    return this.currentUserSubject.value;
  }

  clearSession(): void {
    this.clearCurrentUser();
  }

  getGoogleStartUrl(): Observable<{ authorizationUrl: string }> {
    return this.http.get<{ authorizationUrl: string }>(`${this.apiUrl}/google/start`);
  }

  startGoogleLogin(): void {
    this.getGoogleStartUrl().subscribe({
      next: (result) => {
        if (result.authorizationUrl) {
          window.location.assign(result.authorizationUrl);
        }
      },
    });
  }

  exchangeGoogleCode(code: string): Observable<LoginResponse | Client> {
    return this.http.post<LoginResponse | Client>(`${this.apiUrl}/google/exchange`, { code })
      .pipe(tap((result) => {
        const client = 'client' in result ? result.client : this.profileFromResponse(result);
        if (client) {
          this.setCurrentUser(client);
        }
        resetMontclairCsrfCache();
      }));
  }

  me(): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/me`).pipe(
      tap((client) => this.setCurrentUser(client)),
      catchError((error) => {
        this.clearCurrentUser();
        return throwError(() => error);
      }),
    );
  }

  restoreSession(): Observable<Client | null> {
    if (!this.restoredSession$) {
      this.restoredSession$ = this.http.get<Client>(`${this.apiUrl}/me`).pipe(
        map((client) => {
          this.setCurrentUser(client);
          return client;
        }),
        catchError(() => {
          this.clearCurrentUser();
          return of(null);
        }),
        finalize(() => {
          // Allow a later explicit reload after logout/login to perform a new server check.
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );
    }
    return this.restoredSession$;
  }

  reloadSession(): Observable<Client | null> {
    this.restoredSession$ = undefined;
    return this.restoreSession();
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout`, {}).pipe(
      finalize(() => {
        this.clearCurrentUser();
        this.restoredSession$ = of(null).pipe(shareReplay(1));
        resetMontclairCsrfCache();
      }),
    );
  }

  getRedirectForClient(client: Client): string[] {
    const role = client.role?.toUpperCase();
    if (role === 'ADMIN') return ['/admin/rooms'];
    if (role === 'OPERATOR') return ['/operator/reservations'];
    return ['/profile', String(client.id)];
  }

  setCurrentUser(client: Client): void {
    const safeClient = this.toNonSensitiveClient(client);
    this.currentUserSubject.next(safeClient);
    localStorage.setItem(this.storageKey, JSON.stringify(safeClient));
    this.restoredSession$ = of(safeClient).pipe(shareReplay({ bufferSize: 1, refCount: false }));
  }

  clearCurrentUser(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem(this.storageKey);
  }

  private profileFromResponse(response: unknown): Client | undefined {
    if (!response || typeof response !== 'object') return undefined;
    const record = response as Record<string, unknown>;
    return typeof record['id'] === 'number' ? record as unknown as Client : undefined;
  }

  private toNonSensitiveClient(client: Client): Client {
    const { password: _password, ...safeClient } = client;
    return safeClient as Client;
  }

  private readStoredUser(): Client | null {
    try {
      const value = localStorage.getItem(this.storageKey);
      return value ? JSON.parse(value) as Client : null;
    } catch {
      return null;
    }
  }
}
