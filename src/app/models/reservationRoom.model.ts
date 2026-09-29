import { Reservation } from './reservation.model';
import { Room } from './room.model';

export interface ReservationRoom {
  id: number;
  reservation: Reservation;
  room: Room;
  pricePerNight: number;
}
