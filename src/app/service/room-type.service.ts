import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { RoomType } from '../models/roomType.model';
import { environment } from '../../environments/environment';

// Acceso a la API REST de tipos de habitación (/api/room-types).
@Injectable({
  providedIn: 'root',
})
export class RoomTypeService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/room-types`;

  // Suites oficiales de MontClair Grand Hotel como respaldo
  private readonly defaultRoomTypes: RoomType[] = [
    {
      id: 1,
      name: 'Simple',
      description: 'Habitación estándar con acabados en maderas nobles, cama confort y baño privado.',
      pricePerNight: 80.0,
      imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 2,
      name: 'Deluxe',
      description: 'Habitación amplia con servicios premium, cama King Size, balcón y vistas al mar.',
      pricePerNight: 116.52,
      imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 3,
      name: 'Suite',
      description: 'Habitación de gran lujo con sala de estar privada, tina de hidromasaje y terraza.',
      pricePerNight: 200.0,
      imageUrl: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 4,
      name: 'Premium Suite',
      description: 'Suite exclusiva con balcón privado, amenidades de alta gama y zona de trabajo.',
      pricePerNight: 280.0,
      imageUrl: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 5,
      name: 'Suite Royale',
      description: 'La máxima experiencia de lujo con terraza panorámica, mayordomo y detalles de oro.',
      pricePerNight: 350.0,
      imageUrl: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    },
  ];

  // Lista todos los tipos de habitación.
  findAll(): Observable<RoomType[]> {
    return this.http.get<RoomType[]>(this.apiUrl).pipe(
      map((types) => (types && types.length > 0 ? types : this.defaultRoomTypes)),
      catchError(() => of(this.defaultRoomTypes)),
    );
  }

  // Busca un tipo de habitación por su id.
  findById(id: number): Observable<RoomType> {
    return this.http.get<RoomType>(`${this.apiUrl}/${id}`).pipe(
      catchError(() => {
        const found = this.defaultRoomTypes.find((t) => t.id === id);
        return of(found || this.defaultRoomTypes[0]);
      }),
    );
  }

  // Crea un tipo de habitación.
  add(roomType: RoomType | Omit<RoomType, 'id'>): Observable<RoomType> {
    const { id, ...payload } = roomType as any;
    return this.http.post<RoomType>(this.apiUrl, payload);
  }

  // Reemplaza los datos de un tipo de habitación (PUT).
  update(id: number, roomType: RoomType): Observable<RoomType> {
    return this.http.put<RoomType>(`${this.apiUrl}/${id}`, roomType);
  }

  // Elimina un tipo de habitación.
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
