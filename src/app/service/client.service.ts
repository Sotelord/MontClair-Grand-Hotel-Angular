import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Client } from '../models/client.model';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/clients';

  constructor() {
    this.loadFromBackend();
  }

  // REST API Observable Methods (Consumo Spring Boot)
  findAll(): Observable<Client[]> {
    return this.http.get<Client[]>(this.apiUrl).pipe(
      tap((data) => {
        if (data) {
          this.clients = data;
        }
      })
    );
  }

  findById(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${id}`);
  }

  add(client: Omit<Client, 'id'> | Client): Observable<Client> {
    return this.http.post<Client>(this.apiUrl, client);
  }

  update(id: number, client: Client): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/${id}`, client);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private loadFromBackend(): void {
    this.findAll().subscribe({
      next: () => {},
      error: () => {},
    });
  }

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
    this.add(clientToAdd).subscribe({
      next: (res) => { if (res?.id) clientToAdd.id = res.id; },
      error: () => {}
    });
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
    this.update(client.id, client).subscribe({ error: () => {} });
    return { success: true };
  }

  deleteClient(id: number): { success: boolean; message?: string } {
    const index = this.clients.findIndex((c) => c.id === id);
    if (index === -1) {
      return { success: false, message: 'El cliente no existe.' };
    }
    this.clients.splice(index, 1);
    this.delete(id).subscribe({ error: () => {} });
    return { success: true };
  }

  private clients: Client[] = [];
}
