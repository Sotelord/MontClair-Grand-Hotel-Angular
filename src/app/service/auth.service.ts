import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Client } from '../models/client.model';

export interface LoginResponse {
  success: boolean;
  client?: Client;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/auth';
  private readonly SESSION_KEY = 'currentClient';

  login(identifier: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, {
        identifier: identifier.trim(),
        password: password.trim(),
      })
      .pipe(
        tap((res) => {
          if (res.success && res.client) {
            this.saveSession(res.client);
          }
        }),
      );
  }

  saveSession(client: Client): void {
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(client));
  }

  getSession(): Client | null {
    const raw = localStorage.getItem(this.SESSION_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as Client;
    } catch {
      return null;
    }
  }

  clearSession(): void {
    localStorage.removeItem(this.SESSION_KEY);
  }
}
