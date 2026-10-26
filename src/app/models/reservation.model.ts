import { Client } from './client.model';
import { ReservationRoom } from './reservationRoom.model';

/**
 * Estados del ciclo de vida de la reserva:
 * - CONFIRMED: Creada y confirmada (esperando llegada del huésped)
 * - ACTIVE: Estadía activa (el huésped ha llegado al hotel)
 * - INACTIVE: Estadía finalizada / check-out realizado
 * - CANCELLED: Reserva cancelada (se conserva para el historial del usuario)
 */
export type ReservationStatus =
  | 'CONFIRMED'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'CANCELLED';

export interface Reservation {
  id: number;
  client: Client;
  checkInDate: string;
  checkOutDate: string;
  numberOfPeople: number;
  status: string;
  paid?: boolean;
  pendingBalance?: number;
  reservationRooms?: ReservationRoom[];
}

export interface ReservationRequestDTO {
  clientId: number;
  roomTypeId: number;
  checkInDate: string;
  checkOutDate: string;
  numberOfPeople: number;
  serviceIds: number[];
}

export interface ReservationServiceDTO {
  id: number;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

/**
 * DTO plano devuelto por el backend sin objetos anidados circulares.
 * Incluye campos calculados de totales, estado de la estancia y estado de pago de la cuenta.
 */
export interface ReservationDTO {
  id: number;

  clientId?: number;
  clientFirstName: string;
  clientLastName: string;
  clientEmail: string;
  clientPhone: string;
  client: Client;

  roomId?: number;
  roomNumber: string;
  roomName: string;
  roomTypeName: string;
  roomTypeId?: number;

  pricePerNight: number;

  checkInDate: string;
  checkOutDate: string;

  numberOfPeople: number;
  status: string;

  /**
   * Indica si la cuenta de la estadía ya fue pagada (paid = true: cuenta limpia).
   */
  paid: boolean;

  /**
   * Saldo pendiente de pago (0 si paid es true; de lo contrario igual a totalPrice).
   */
  pendingBalance: number;

  nights: number;
  roomSubtotal: number;
  servicesSubtotal: number;
  totalPrice: number;

  services: ReservationServiceDTO[];
  reservationRooms?: ReservationRoom[];
}
