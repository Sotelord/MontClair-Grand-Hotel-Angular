import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { RoomType } from '../models/roomType.model';

@Injectable({
  providedIn: 'root',
})
export class RoomTypeService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/room-types';
  private roomTypes: RoomType[] = [];
  private readonly roomTypesSubject = new BehaviorSubject<RoomType[]>([]);
  readonly roomTypes$ = this.roomTypesSubject.asObservable();



  private syncRoomTypes(data: RoomType[]): void {
    this.roomTypes = [...data];
    this.roomTypesSubject.next([...this.roomTypes]);
  }

  findAll(): Observable<RoomType[]> {
    return this.http.get<RoomType[]>(this.apiUrl).pipe(
      tap((data) => {
        this.syncRoomTypes(data || []);
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
          this.syncRoomTypes([...this.roomTypes, saved]);
        }
      }),
    );
  }

  update(id: number, roomType: RoomType): Observable<RoomType> {
    return this.http.put<RoomType>(`${this.apiUrl}/${id}`, roomType).pipe(
      tap((updated) => {
        const nextRoomTypes = this.roomTypes.map((t) =>
          t.id === id ? { ...t, ...updated } : t,
        );
        this.syncRoomTypes(nextRoomTypes);
      }),
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.syncRoomTypes(this.roomTypes.filter((t) => t.id !== id));
      }),
    );
  }

  getRoomTypes(): RoomType[] {
    return [...this.roomTypes];
  }

  getRoomTypeById(id: number): RoomType | undefined {
    return this.roomTypes.find((roomType) => roomType.id === id);
  }
}
