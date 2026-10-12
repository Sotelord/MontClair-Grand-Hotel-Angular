import { Reservation } from './reservation.model';
import { Room } from './room.model';
import { AcquiredService } from './adquiredService.model';

export interface ReservationRoom {
  id: number;
  reservation?: Reservation;
  room: Room;
  pricePerNight: number;
  acquiredServices?: AcquiredService[];
}
