import { Injectable } from '@angular/core';
import { Client } from '../models/client.model';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  constructor() {}

  getClients(): Client[] {
    return this.clients;
  }

  getClientById(id: number): Client | undefined {
    return this.clients.find((item) => item.id === id);
  }

  getClientByUsernameOrEmail(identifier: string): Client | undefined {
    const clean = identifier.trim().toLowerCase();
    return this.clients.find(
      (c) => c.username.toLowerCase() === clean || c.email.toLowerCase() === clean
    );
  }

  addClient(newClient: Omit<Client, 'id'> | Client): { success: boolean; message?: string; client?: Client } {
    const cleanUsername = newClient.username.trim().toLowerCase();
    const cleanEmail = newClient.email.trim().toLowerCase();

    const existsUsername = this.clients.some((c) => c.username.toLowerCase() === cleanUsername);
    if (existsUsername) {
      return { success: false, message: `El nombre de usuario '${newClient.username}' ya está en uso.` };
    }

    const existsEmail = this.clients.some((c) => c.email.toLowerCase() === cleanEmail);
    if (existsEmail) {
      return { success: false, message: `El correo electrónico '${newClient.email}' ya está registrado.` };
    }

    const nextId = this.clients.length > 0 ? Math.max(...this.clients.map((c) => c.id)) + 1 : 1;
    const clientToAdd: Client = {
      ...newClient,
      id: nextId,
      avatarUrl: newClient.avatarUrl?.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      role: newClient.role || 'CLIENT',
    };

    this.clients.push(clientToAdd);
    return { success: true, client: clientToAdd };
  }

  updateClient(client: Client): { success: boolean; message?: string } {
    const index = this.clients.findIndex((c) => c.id === client.id);
    if (index === -1) {
      return { success: false, message: 'Cliente no encontrado.' };
    }

    const cleanUsername = client.username.trim().toLowerCase();
    const cleanEmail = client.email.trim().toLowerCase();

    const usernameConflict = this.clients.some(
      (c) => c.id !== client.id && c.username.toLowerCase() === cleanUsername
    );
    if (usernameConflict) {
      return { success: false, message: `El nombre de usuario '${client.username}' ya está en uso.` };
    }

    const emailConflict = this.clients.some(
      (c) => c.id !== client.id && c.email.toLowerCase() === cleanEmail
    );
    if (emailConflict) {
      return { success: false, message: `El correo electrónico '${client.email}' ya está registrado.` };
    }

    this.clients[index] = {
      ...client,
      avatarUrl: client.avatarUrl?.trim() || this.clients[index].avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    };
    return { success: true };
  }

  deleteClient(id: number): { success: boolean; message?: string } {
    const index = this.clients.findIndex((c) => c.id === id);
    if (index === -1) {
      return { success: false, message: 'El cliente no existe.' };
    }
    this.clients.splice(index, 1);
    return { success: true };
  }

  private clients: Client[] = [
    {
      id: 1,
      username: 'admin',
      password: 'admin',
      email: 'admin@hotelmontclair.com',
      firstName: 'Administrador',
      lastName: 'Montclair',
      phone: '+34 910 000 001',
      role: 'ADMIN',
    },
    {
      id: 2,
      username: 'demo',
      password: 'demo',
      email: 'demo@example.com',
      firstName: 'Demo',
      lastName: 'User',
      phone: '+34 612 345 678',
      role: 'CLIENT',
    },
    {
      id: 3,
      username: 'cliente3',
      password: 'cliente3',
      email: 'cliente3@example.com',
      firstName: 'Cliente',
      lastName: 'Montclair',
      phone: '+34 612 345 603',
      role: 'CLIENT',
    },
    {
      id: 4,
      username: 'cliente4',
      password: 'cliente4',
      email: 'cliente4@example.com',
      firstName: 'Cliente',
      lastName: 'Montclair',
      phone: '+34 612 345 604',
      role: 'CLIENT',
    },
    {
      id: 5,
      username: 'cliente5',
      password: 'cliente5',
      email: 'cliente5@example.com',
      firstName: 'Cliente',
      lastName: 'Montclair',
      phone: '+34 612 345 605',
      role: 'CLIENT',
    },
    {
      id: 6,
      username: 'cliente6',
      password: 'cliente6',
      email: 'cliente6@example.com',
      firstName: 'Cliente',
      lastName: 'Montclair',
      phone: '+34 612 345 606',
      role: 'CLIENT',
    },
    {
      id: 7,
      username: 'cliente7',
      password: 'cliente7',
      email: 'cliente7@example.com',
      firstName: 'Cliente',
      lastName: 'Montclair',
      phone: '+34 612 345 607',
      role: 'CLIENT',
    },
    {
      id: 8,
      username: 'cliente8',
      password: 'cliente8',
      email: 'cliente8@example.com',
      firstName: 'Cliente',
      lastName: 'Montclair',
      phone: '+34 612 345 608',
      role: 'CLIENT',
    },
    {
      id: 9,
      username: 'cliente9',
      password: 'cliente9',
      email: 'cliente9@example.com',
      firstName: 'Cliente',
      lastName: 'Montclair',
      phone: '+34 612 345 609',
      role: 'CLIENT',
    },
    {
      id: 10,
      username: 'cliente10',
      password: 'cliente10',
      email: 'cliente10@example.com',
      firstName: 'Cliente',
      lastName: 'Montclair',
      phone: '+34 612 345 610',
      role: 'CLIENT',
    },
    {
      id: 11,
      username: 'cliente11',
      password: 'cliente11',
      email: 'cliente11@example.com',
      firstName: 'Cliente',
      lastName: 'Montclair',
      phone: '+34 612 345 611',
      role: 'CLIENT',
    },
  ];
}
