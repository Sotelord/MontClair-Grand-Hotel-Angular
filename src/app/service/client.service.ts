import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client } from '../models/client.model';

//Acceso a la API REST de clientes (/api/clients).
@Injectable({
  providedIn: 'root',
})
export class ClientService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/clients';

  //Lista todos los clientes.
  findAll(): Observable<Client[]> {
    return this.http.get<Client[]>(this.apiUrl);
  }

  //Busca un cliente por su id.
  findById(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${id}`);
  }

  //Crea un cliente. Se quita el `id` del cuerpo porque lo genera el backend.
  add(client: Omit<Client, 'id'> | Client): Observable<Client> {
    const { id, ...payload } = client as any;
    return this.http.post<Client>(this.apiUrl, payload);
  }

  //Reemplaza los datos de un cliente existente (PUT).
  update(id: number, client: Client): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/${id}`, client);
  }

  //Elimina un cliente por su id.
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
