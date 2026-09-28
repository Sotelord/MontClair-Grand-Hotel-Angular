import { Injectable } from '@angular/core';
import { RoomType } from '../models/roomType.model';

@Injectable({
  providedIn: 'root',
})
export class RoomTypeService {
  constructor() {}

  deleteRoomType(roomType: RoomType): void {
    const index = this.roomTypes.findIndex((type) => type.id === roomType.id);
    if (index !== -1) {
      this.roomTypes.splice(index, 1);
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
  }

  updateRoomType(roomType: RoomType): void {
    const index = this.roomTypes.findIndex((type) => type.id === roomType.id);
    if (index !== -1) {
      this.roomTypes[index] = roomType;
    }
  }

  private roomTypes: RoomType[] = [
    {
      id: 1,
      name: 'Simple',
      description: 'Habitación estándar',
      pricePerNight: 80.0,
      imageUrl:
        'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 2,
      name: 'Deluxe',
      description: 'Habitación amplia con servicios premium',
      pricePerNight: 116.52,
      imageUrl:
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 3,
      name: 'Suite',
      description: 'Habitación de lujo con sala privada',
      pricePerNight: 200.0,
      imageUrl:
        'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 4,
      name: 'Premium Suite',
      description: 'Suite exclusiva con balcón privado',
      pricePerNight: 280.0,
      imageUrl:
        'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 5,
      name: 'Suite Royale',
      description: 'La experiencia más exclusiva del hotel',
      pricePerNight: 350.0,
      imageUrl:
        'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
    },
  ];
}
