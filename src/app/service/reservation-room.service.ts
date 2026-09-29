import { Injectable } from '@angular/core';
import { ReservationRoom } from '../models/reservationRoom.model';
import { ReservationService } from './reservation.service';
import { RoomService } from './room.service';

@Injectable({
  providedIn: 'root',
})
export class ReservationRoomService {
  constructor(
    private reservationService: ReservationService,
    private roomService: RoomService,
  ) {}

  getReservationRooms(): ReservationRoom[] {
    return this.reservationRooms;
  }

  getReservationRoomById(id: number): ReservationRoom | undefined {
    return this.reservationRooms.find((item) => item.id === id);
  }

  private get reservationRooms(): ReservationRoom[] {
    return [
    {
      id: 1,
      reservation: this.reservationService.getReservationById(1)!,
      room: this.roomService.getRoomById(1)!,
      pricePerNight: 80.0,
    },
    {
      id: 2,
      reservation: this.reservationService.getReservationById(2)!,
      room: this.roomService.getRoomById(2)!,
      pricePerNight: 116.52,
    },
    {
      id: 3,
      reservation: this.reservationService.getReservationById(3)!,
      room: this.roomService.getRoomById(3)!,
      pricePerNight: 200.0,
    },
    {
      id: 4,
      reservation: this.reservationService.getReservationById(4)!,
      room: this.roomService.getRoomById(4)!,
      pricePerNight: 280.0,
    },
    {
      id: 5,
      reservation: this.reservationService.getReservationById(5)!,
      room: this.roomService.getRoomById(5)!,
      pricePerNight: 350.0,
    },
    ];
  }
}
