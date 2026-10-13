import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Client } from '../models/client.model';
import { ClientService } from './client.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private clientService = inject(ClientService);
  private apiUrl = 'http://localhost:8080/api/auth';

  currentUser = signal<Client | null>(this.getInitialUser());

  loginApi(
    identifier: string,
    password: string,
  ): Observable<{ success: boolean; client?: Client; message?: string }> {
    return this.http
      .post<{ success: boolean; client?: Client; message?: string }>(
        `${this.apiUrl}/login`,
        {
          identifier,
          password,
        },
      )
      .pipe(
        tap((res) => {
          if (res.success && res.client) {
            this.setCurrentUser(res.client);
          }
        }),
      );
  }

  private getInitialUser(): Client | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem('montclair_current_user');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {}
      }
    }
    return this.clientService.getClientById(1) || null;
  }

  login(
    identifier: string,
    password: string,
  ): { success: boolean; message?: string; client?: Client } {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    const client = this.clientService.getClients().find((c) => {
      const matchUser = c.username.toLowerCase() === cleanId;
      const matchEmail = c.email.toLowerCase() === cleanId;
      return (matchUser || matchEmail) && c.password === cleanPass;
    });

    if (client) {
      this.currentUser.set(client);
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('montclair_current_user', JSON.stringify(client));
      }
      return { success: true, client };
    } else {
      return {
        success: false,
        message: 'Usuario o contraseña incorrectos.',
      };
    }
  }

  logout(): void {
    this.currentUser.set(null);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('montclair_current_user');
    }
  }

  setCurrentUser(client: Client): void {
    this.currentUser.set(client);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('montclair_current_user', JSON.stringify(client));
    }
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  isAdmin(): boolean {
    const user = this.currentUser();
    return user !== null && user.role?.toUpperCase() === 'ADMIN';
  }
}
