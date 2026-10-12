import { Injectable, signal, inject } from '@angular/core';
import { Client } from '../models/client.model';
import { ClientService } from './client.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private clientService = inject(ClientService);

  // Signal storing current user, initialized with demo user if available or null
  currentUser = signal<Client | null>(this.getInitialUser());

  private getInitialUser(): Client | null {
    // Check localStorage if available, or default to demo user for a smooth experience
    if (typeof window !== 'undefined' && window.localStorage) {
      const stored = localStorage.getItem('montclair_current_user');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // fallback
        }
      }
    }
    // Default to admin or demo user initially so existing views work out of the box
    return this.clientService.getClientById(1) || null;
  }

  /**
   * Login manejado mediante verificación 'if':
   * Si username/email y password coinciden exactamente con un cliente registrado, entra.
   */
  login(identifier: string, password: string): { success: boolean; message?: string; client?: Client } {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password.trim();

    const client = this.clientService.getClients().find(c => {
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
