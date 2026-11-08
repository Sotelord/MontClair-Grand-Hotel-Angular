import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Room } from '../models/room.model';

//Acceso a la API REST de habitaciones (/api/rooms).
@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/rooms';

  //Lista todas las habitaciones, sin importar su estado.
  findAll(): Observable<Room[]> {
    return this.http.get<Room[]>(this.apiUrl);
  }

  //Lista solo las habitaciones disponibles (GET /api/rooms?status=AVAILABLE).
  findAvailable(): Observable<Room[]> {
    const params = new HttpParams().set('status', 'AVAILABLE');

    return this.http.get<Room[]>(this.apiUrl, { params });
  }

  //Busca una habitación por su id.
  findById(id: number): Observable<Room> {
    return this.http.get<Room>(`${this.apiUrl}/${id}`);
  }

  //Lista las habitaciones de una categoría (tipo de habitación).
  findByTypeId(typeId: number): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.apiUrl}/type/${typeId}`);
  }

  //Crea una habitación. Se quita el `id` del cuerpo porque lo genera el backend.
  add(room: Room | Omit<Room, 'id'>): Observable<Room> {
    const { id, ...payload } = room as any;

    return this.http.post<Room>(this.apiUrl, payload);
  }

  //Reemplaza los datos de una habitación (PUT).
  update(id: number, room: Room): Observable<Room> {
    return this.http.put<Room>(`${this.apiUrl}/${id}`, room);
  }

  //Elimina una habitación por su id.
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
