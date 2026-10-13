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

  // REST API Observable Methods (Consumo Spring Boot)
  findAll(): Observable<RoomType[]> {
    return this.http.get<RoomType[]>(this.apiUrl).pipe(
      tap((data) => {
        if (data) {
          this.roomTypes = data;
        }
      })
    );
  }

  findById(id: number): Observable<RoomType> {
    return this.http.get<RoomType>(`${this.apiUrl}/${id}`);
  }

  add(roomType: RoomType): Observable<RoomType> {
    return this.http.post<RoomType>(this.apiUrl, roomType);
  }

  update(id: number, roomType: RoomType): Observable<RoomType> {
    return this.http.put<RoomType>(`${this.apiUrl}/${id}`, roomType);
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

  deleteRoomType(roomType: RoomType): void {
    const index = this.roomTypes.findIndex((type) => type.id === roomType.id);
    if (index !== -1) {
      this.roomTypes.splice(index, 1);
      this.delete(roomType.id).subscribe({ error: () => {} });
    }
  }

  getRoomTypes(): RoomType[] {
    return this.roomTypes;
  }

  getRoomTypeById(id: number): RoomType | undefined {
    return this.roomTypes.find((roomType) => roomType.id === id);
  }

  addRoomType(roomType: RoomType): void {
    const newId = this.roomTypes.length > 0 ? Math.max(...this.roomTypes.map(r => r.id)) + 1 : 1;
    roomType.id = newId;
    this.roomTypes.push(roomType);
    this.add(roomType).subscribe({
      next: (res) => { if (res?.id) roomType.id = res.id; },
      error: () => {}
    });
  }

  updateRoomType(roomType: RoomType): void {
    const index = this.roomTypes.findIndex((type) => type.id === roomType.id);
    if (index !== -1) {
      this.roomTypes[index] = roomType;
      this.update(roomType.id, roomType).subscribe({ error: () => {} });
    }
  }

  private roomTypes: RoomType[] = [];
}
