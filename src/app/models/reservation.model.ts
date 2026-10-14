
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

export interface ReservationServiceDTO {
  id: number;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface ReservationDTO {
  id: number;

  clientFirstName: string;
  clientLastName: string;
  clientEmail: string;
  clientPhone: string;

  roomNumber: string;
  roomName: string;
  roomTypeName: string;

  pricePerNight: number;

  checkInDate: string;
  checkOutDate: string;

  numberOfPeople: number;
  status: string;

  nights: number;
  roomSubtotal: number;
  servicesSubtotal: number;
  totalPrice: number;

  services: ReservationServiceDTO[];
}
