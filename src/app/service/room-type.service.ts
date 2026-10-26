import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RoomType } from '../models/roomType.model';

//Acceso a la API REST de tipos de habitación (/api/room-types).
@Injectable({
  providedIn: 'root',
})
export class RoomTypeService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/room-types';

  //Lista todos los tipos de habitación.
  findAll(): Observable<RoomType[]> {
    return this.http.get<RoomType[]>(this.apiUrl);
  }

  //Busca un tipo de habitación por su id.
  findById(id: number): Observable<RoomType> {
    return this.http.get<RoomType>(`${this.apiUrl}/${id}`);
  }

  //Crea un tipo de habitación. Se quita el `id` del cuerpo porque lo genera el backend.
  add(roomType: RoomType | Omit<RoomType, 'id'>): Observable<RoomType> {
    const { id, ...payload } = roomType as any;
    return this.http.post<RoomType>(this.apiUrl, payload);
  }

  //Reemplaza los datos de un tipo de habitación (PUT).
  update(id: number, roomType: RoomType): Observable<RoomType> {
    return this.http.put<RoomType>(`${this.apiUrl}/${id}`, roomType);
  }

  //Elimina un tipo de habitación; el backend puede rechazarlo si tiene habitaciones asociadas.
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
