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

  currentUser: Client | null = null;

  login(identifier: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, {
        identifier: identifier.trim(),
        password: password.trim(),
      })
      .pipe(
        tap((res) => {
          if (res.success && res.client) {
            this.currentUser = res.client;
          }
        }),
      );
  }

  logout(): void {
    this.currentUser = null;
  }

  setCurrentUser(client: Client | null): void {
    this.currentUser = client;
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  isAdmin(): boolean {
    return (
      this.currentUser !== null &&
      (this.currentUser.role?.toUpperCase() === 'ADMIN' ||
        this.currentUser.username?.toLowerCase() === 'admin')
    );
  }
}
