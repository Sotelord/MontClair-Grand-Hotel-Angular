import { Client } from './client.model';
import { ReservationRoom } from './reservationRoom.model';

export interface Reservation {
  id: number;
  client: Client;
  checkInDate: string;
  checkOutDate: string;
  numberOfPeople: number;
  status: string;
  reservationRooms?: ReservationRoom[];
}
