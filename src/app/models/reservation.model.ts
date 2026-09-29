import { Client } from './client.model';

export interface Reservation {
  id: number;
  client: Client;
  checkInDate: string;
  checkOutDate: string;
  numberOfPeople: number;
  status: string;
}
