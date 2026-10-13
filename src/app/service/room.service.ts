import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Room } from '../models/room.model';
import { RoomTypeService } from './room-type.service';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/rooms';
  private rooms: Room[] = [];

  constructor(private roomTypeService: RoomTypeService) {
    this.loadFromBackend();
  }

  // REST API Observable Methods (Consumo Spring Boot)
  findAll(): Observable<Room[]> {
    return this.http.get<Room[]>(this.apiUrl).pipe(
      tap((data) => {
        if (data) {
          this.rooms = data.map((r: any) => ({
            ...r,
            roomType: r.roomType || r.type || this.roomTypeService.getRoomTypeById(r.typeId || 1)!,
            highlights: r.highlights || [],
            galleryImages: r.galleryImages || [],
          }));
        }
      })
    );
  }

  findById(id: number): Observable<Room> {
    return this.http.get<Room>(`${this.apiUrl}/${id}`);
  }

  add(room: Room | Omit<Room, 'id'>): Observable<Room> {
    const { id, ...rest } = room as any;
    const payload = {
      ...rest,
      typeId: (room as any).roomType?.id || (room as any).typeId,
    };
    return this.http.post<Room>(this.apiUrl, payload).pipe(
      tap((saved: any) => {
        if (saved) {
          const mapped: Room = {
            ...saved,
            roomType: saved.roomType || saved.type || this.roomTypeService.getRoomTypeById(saved.typeId || 1)!,
            highlights: saved.highlights || [],
            galleryImages: saved.galleryImages || [],
          };
          this.rooms.unshift(mapped);
        }
      })
    );
  }

  update(id: number, room: Room): Observable<Room> {
    const payload = {
      ...room,
      typeId: room.roomType?.id || (room as any).typeId,
    };
    return this.http.put<Room>(`${this.apiUrl}/${id}`, payload).pipe(
      tap((updated: any) => {
        const idx = this.rooms.findIndex((r) => r.id === id);
        if (idx !== -1) {
          this.rooms[idx] = {
            ...updated,
            roomType: updated.roomType || updated.type || this.roomTypeService.getRoomTypeById(updated.typeId || 1)!,
            highlights: updated.highlights || [],
            galleryImages: updated.galleryImages || [],
          };
        }
      })
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.rooms = this.rooms.filter((r) => r.id !== id);
      })
    );
  }

  private loadFromBackend(): void {
    this.findAll().subscribe({
      next: () => {},
      error: () => {},
    });
  }

  getRooms(): Room[] {
    return this.rooms;
  }

  getRoomById(id: number): Room | undefined {
    return this.rooms.find((item) => item.id === id);
  }

  getRoomsByTypeId(typeId: number): Room[] {
    return this.rooms.filter((room) => room.roomType?.id === typeId);
  }

  isNumberTaken(num: string, excludeId?: number): boolean {
    const cleanNum = num.trim();
    return this.rooms.some((r) => r.number === cleanNum && r.id !== excludeId);
  }

}
