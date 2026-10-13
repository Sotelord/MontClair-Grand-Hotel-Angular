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
    const payload = {
      ...room,
      typeId: (room as any).roomType?.id || (room as any).typeId,
    };
    return this.http.post<Room>(this.apiUrl, payload);
  }

  update(id: number, room: Room): Observable<Room> {
    const payload = {
      ...room,
      typeId: room.roomType?.id || (room as any).typeId,
    };
    return this.http.put<Room>(`${this.apiUrl}/${id}`, payload);
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

  addRoom(newRoom: Omit<Room, 'id'> | Room): { success: boolean; message?: string; room?: Room } {
    if (this.isNumberTaken(newRoom.number)) {
      return { success: false, message: `No se pudo guardar: Ya existe una habitación con el número '${newRoom.number}'.` };
    }

    const nextId = this.rooms.length > 0 ? Math.max(...this.rooms.map((r) => r.id)) + 1 : 1;
    const roomToAdd: Room = {
      ...newRoom,
      id: nextId,
      highlights: newRoom.highlights || [],
      galleryImages: newRoom.galleryImages || [],
    };

    this.rooms.unshift(roomToAdd);
    this.add(roomToAdd).subscribe({
      next: (res) => { if (res?.id) roomToAdd.id = res.id; },
      error: () => {}
    });
    return { success: true, room: roomToAdd };
  }

  updateRoom(room: Room): { success: boolean; message?: string } {
    const index = this.rooms.findIndex((r) => r.id === room.id);
    if (index === -1) {
      return { success: false, message: 'La habitación no fue encontrada.' };
    }

    if (this.isNumberTaken(room.number, room.id)) {
      return { success: false, message: `No se pudo guardar: Ya existe una habitación con el número '${room.number}'.` };
    }

    this.rooms[index] = {
      ...this.rooms[index],
      ...room,
      highlights: room.highlights || this.rooms[index].highlights || [],
      galleryImages: room.galleryImages || this.rooms[index].galleryImages || [],
    };
    this.update(room.id, room).subscribe({ error: () => {} });
    return { success: true };
  }

  deleteRoom(id: number): { success: boolean; message?: string } {
    const index = this.rooms.findIndex((r) => r.id === id);
    if (index === -1) {
      return { success: false, message: 'La habitación no existe.' };
    }
    this.rooms.splice(index, 1);
    this.delete(id).subscribe({ error: () => {} });
    return { success: true };
  }
}
