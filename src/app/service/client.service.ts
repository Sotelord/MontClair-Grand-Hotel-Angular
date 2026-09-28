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
