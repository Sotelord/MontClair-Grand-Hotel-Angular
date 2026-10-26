import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Client } from '../models/client.model';

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

  //Clave con la que se guarda el cliente en localStorage.
  private readonly SESSION_KEY = 'currentClient';

  /*Envía las credenciales al backend (POST /api/auth/login). Si el login es exitoso, guarda la sesión automáticamente con `tap`,
  sin alterar lo que recibe quien se suscriba.*/
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

  //Guarda el cliente en localStorage como JSON.
  saveSession(client: Client): void {
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(client));
  }

  //Lee la sesión guardada. @returns el cliente, o null si no hay sesión o el JSON está dañado
  getSession(): Client | null {
    const raw = localStorage.getItem(this.SESSION_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as Client;
    } catch {
      // El valor guardado no es JSON válido: se trata como "sin sesión".
      return null;
    }
  }

  //Cierra la sesión borrando el cliente de localStorage.
  clearSession(): void {
    localStorage.removeItem(this.SESSION_KEY);
  }
}
