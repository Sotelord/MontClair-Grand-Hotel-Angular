import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { RoomType } from '../models/roomType.model';

@Injectable({
  providedIn: 'root',
})
export class RoomTypeService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/room-types';

  constructor() {
    this.loadFromBackend();
  }

  findAll(): Observable<RoomType[]> {
    return this.http.get<RoomType[]>(this.apiUrl).pipe(
      tap((data) => {
        if (data) {
          this.roomTypes = data;
        }
      }),
    );
  }

  findById(id: number): Observable<RoomType> {
    return this.http.get<RoomType>(`${this.apiUrl}/${id}`);
  }

  add(roomType: RoomType | Omit<RoomType, 'id'>): Observable<RoomType> {
    const { id, ...payload } = roomType as any;
    return this.http.post<RoomType>(this.apiUrl, payload).pipe(
      tap((saved) => {
        if (saved) {
          this.roomTypes.push(saved);
        }
      }),
    );
  }

  update(id: number, roomType: RoomType): Observable<RoomType> {
    return this.http.put<RoomType>(`${this.apiUrl}/${id}`, roomType).pipe(
      tap((updated) => {
        const idx = this.roomTypes.findIndex((t) => t.id === id);
        if (idx !== -1) {
          this.roomTypes[idx] = updated;
        }
      }),
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.roomTypes = this.roomTypes.filter((t) => t.id !== id);
      }),
    );
  }

  private loadFromBackend(): void {
    this.findAll().subscribe({
      next: () => {},
      error: () => {},
    });
  }

  getRoomTypes(): RoomType[] {
    return this.roomTypes;
  }

  getRoomTypeById(id: number): RoomType | undefined {
    return this.roomTypes.find((roomType) => roomType.id === id);
  }

  private roomTypes: RoomType[] = [];
}
