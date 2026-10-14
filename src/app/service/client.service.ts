import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client } from '../models/client.model';

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/clients';

  findAll(): Observable<Client[]> {
    return this.http.get<Client[]>(this.apiUrl);
  }

  findById(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${id}`);
  }

  add(client: Omit<Client, 'id'> | Client): Observable<Client> {
    const { id, ...payload } = client as any;
    return this.http.post<Client>(this.apiUrl, payload);
  }

  update(id: number, client: Client): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/${id}`, client);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
