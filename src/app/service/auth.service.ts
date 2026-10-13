import { Injectable, signal, inject } from '@angular/core';
import { Client } from '../models/client.model';
import { ClientService } from './client.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private clientService = inject(ClientService);

  currentUser = signal<Client | null>(null);

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
  }

  setCurrentUser(client: Client): void {
    this.currentUser.set(client);
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  isAdmin(): boolean {
    const user = this.currentUser();
    return user !== null && user.role?.toUpperCase() === 'ADMIN';
  }
}
