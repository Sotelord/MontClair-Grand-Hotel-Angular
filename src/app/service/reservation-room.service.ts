import { Injectable } from '@angular/core';
import { ReservationRoom } from '../models/reservationRoom.model';

@Injectable({
  providedIn: 'root',
})
export class ReservationRoomService {
  constructor() {}

  getReservationRooms(): ReservationRoom[] {
    return this.reservationRooms;
  }

  getReservationRoomById(id: number): ReservationRoom | undefined {
    return this.reservationRooms.find((item) => item.id === id);
  }

  private reservationRooms: ReservationRoom[] = [
    {
      id: 1,
      reservationId: 1,
      roomId: 1,
      pricePerNight: 80.0,
    },
    {
      id: 2,
      reservationId: 2,
      roomId: 2,
      pricePerNight: 116.52,
    },
    {
      id: 3,
      reservationId: 3,
      roomId: 3,
      pricePerNight: 200.0,
    },
    {
      id: 4,
      reservationId: 4,
      roomId: 4,
      pricePerNight: 280.0,
    },
    {
      id: 5,
      reservationId: 5,
      roomId: 5,
      pricePerNight: 350.0,
    },
  ];
}
