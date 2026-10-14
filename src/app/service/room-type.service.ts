import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RoomType } from '../models/roomType.model';

@Injectable({
  providedIn: 'root',
})
export class RoomTypeService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/room-types';

  findAll(): Observable<RoomType[]> {
    return this.http.get<RoomType[]>(this.apiUrl);
  }

  findById(id: number): Observable<RoomType> {
    return this.http.get<RoomType>(`${this.apiUrl}/${id}`);
  }

  add(roomType: RoomType | Omit<RoomType, 'id'>): Observable<RoomType> {
    const { id, ...payload } = roomType as any;
    return this.http.post<RoomType>(this.apiUrl, payload);
  }

  update(id: number, roomType: RoomType): Observable<RoomType> {
    return this.http.put<RoomType>(`${this.apiUrl}/${id}`, roomType);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
