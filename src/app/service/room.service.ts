import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Room, RoomStatus } from '../models/room.model';
import { environment } from '../../environments/environment';

export interface OccupiedRoomRange {
  roomId: number;
  roomNumber: string;
  checkInDate: string;
  checkOutDate: string;
}

//Acceso a la API REST de habitaciones (/api/rooms).
@Injectable({
  providedIn: 'root',
})
export class RoomService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/rooms`;

  //Lista habitaciones filtradas en el backend por tipo y/o estado (GET /api/rooms).
  findAll(filters?: {
    typeId?: number | string | null;
    status?: RoomStatus | string | null;
  }): Observable<Room[]> {
    let params = new HttpParams();
    if (filters?.typeId !== undefined && filters?.typeId !== null && filters.typeId !== '' && filters.typeId !== 'ALL') {
      params = params.set('typeId', String(filters.typeId));
    }
    if (filters?.status !== undefined && filters?.status !== null && filters.status !== '' && filters.status !== 'ALL') {
      params = params.set('status', String(filters.status));
    }

    return this.http.get<Room[]>(this.apiUrl, { params });
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

  //Lista rangos de fechas ocupados por habitación sin datos personales de huéspedes.
  getOccupiedRanges(): Observable<OccupiedRoomRange[]> {
    return this.http.get<OccupiedRoomRange[]>(`${this.apiUrl}/occupied`);
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
