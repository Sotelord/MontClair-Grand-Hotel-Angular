import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Room } from '../models/room.model';
import { RoomTypeService } from './room-type.service';

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/rooms';
  private rooms: Room[] = [];
  private readonly roomsSubject = new BehaviorSubject<Room[]>([]);
  readonly rooms$ = this.roomsSubject.asObservable();

  constructor(private roomTypeService: RoomTypeService) {}

  private syncRooms(data: Room[]): void {
    this.rooms = [...data];
    this.roomsSubject.next([...this.rooms]);
  }

  findAll(): Observable<Room[]> {
    return this.http.get<Room[]>(this.apiUrl).pipe(
      tap((data) => {
        const mapped = (data || []).map((r: any) => ({
          ...r,
          roomType:
            r.roomType ||
            r.type ||
            this.roomTypeService.getRoomTypeById(r.typeId || 1)!,
          highlights: r.highlights || [],
          galleryImages: r.galleryImages || [],
        }));
        this.syncRooms(mapped);
      }),
    );
  }

  findById(id: number): Observable<Room> {
    return this.http.get<Room>(`${this.apiUrl}/${id}`);
  }

  findByTypeId(typeId: number): Observable<Room[]> {
    return this.http.get<Room[]>(`${this.apiUrl}/type-room/${typeId}`).pipe(
      tap((data) => {
        const mapped = (data || []).map((r: any) => ({
          ...r,
          roomType:
            r.roomType ||
            r.type ||
            this.roomTypeService.getRoomTypeById(r.typeId || typeId)!,
          highlights: r.highlights || [],
          galleryImages: r.galleryImages || [],
        }));
        this.syncRooms(mapped);
      }),
    );
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
            roomType:
              saved.roomType ||
              saved.type ||
              this.roomTypeService.getRoomTypeById(saved.typeId || 1)!,
            highlights: saved.highlights || [],
            galleryImages: saved.galleryImages || [],
          };
          this.syncRooms([mapped, ...this.rooms]);
        }
      }),
    );
  }

  update(id: number, room: Room): Observable<Room> {
    const payload = {
      ...room,
      typeId: room.roomType?.id || (room as any).typeId,
    };
    return this.http.put<Room>(`${this.apiUrl}/${id}`, payload).pipe(
      tap((updated: any) => {
        const nextRooms = this.rooms.map((r) =>
          r.id === id
            ? {
                ...r,
                ...updated,
                roomType:
                  updated.roomType ||
                  updated.type ||
                  this.roomTypeService.getRoomTypeById(updated.typeId || 1) ||
                  r.roomType,
                highlights: updated.highlights || r.highlights || [],
                galleryImages: updated.galleryImages || r.galleryImages || [],
              }
            : r,
        );
        this.syncRooms(nextRooms);
      }),
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.syncRooms(this.rooms.filter((r) => r.id !== id));
      }),
    );
  }

  getRooms(): Room[] {
    return [...this.rooms];
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
