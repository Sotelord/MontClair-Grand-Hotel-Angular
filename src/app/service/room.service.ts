
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Room } from '../models/room.model';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/rooms';

  findAll(): Observable<Room[]> {
    return this.http.get<Room[]>(this.apiUrl);
  }

  findAvailable(): Observable<Room[]> {
    const params = new HttpParams().set(
      'status',
      'AVAILABLE',
    );

    return this.http.get<Room[]>(
      this.apiUrl,
      { params },
    );
  }

  findById(id: number): Observable<Room> {
    return this.http.get<Room>(
      `${this.apiUrl}/${id}`,
    );
  }

  findByTypeId(typeId: number): Observable<Room[]> {
    return this.http.get<Room[]>(
      `${this.apiUrl}/type/${typeId}`,
    );
  }

  add(room: Room | Omit<Room, 'id'>): Observable<Room> {
    const { id, ...payload } = room as any;

    return this.http.post<Room>(
      this.apiUrl,
      payload,
    );
  }

  update(id: number, room: Room): Observable<Room> {
    return this.http.put<Room>(
      `${this.apiUrl}/${id}`,
      room,
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`,
    );
  }
}
