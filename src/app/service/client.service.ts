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
    const { id, ...payload } = client as any;
    return this.http.post<Client>(this.apiUrl, payload).pipe(
      tap((saved) => {
        if (saved) {
          this.clients.push(saved);
        }
      })
    );
  }

  update(id: number, client: Client): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/${id}`, client).pipe(
      tap((updated) => {
        const idx = this.clients.findIndex((c) => c.id === id);
        if (idx !== -1) {
          this.clients[idx] = updated;
        }
      })
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.clients = this.clients.filter((c) => c.id !== id);
      })
    );
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



  private clients: Client[] = [];
}
