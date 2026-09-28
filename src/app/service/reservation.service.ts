import { Injectable } from '@angular/core';
import { Reservation } from '../models/reservation.model';

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  constructor() {}

  getReservations(): Reservation[] {
    return this.reservations;
  }

  getReservationById(id: number): Reservation | undefined {
    return this.reservations.find((item) => item.id === id);
  }

  private reservations: Reservation[] = [
    {
      id: 1,
      clientId: 1,
      checkInDate: '2026-09-27',
      checkOutDate: '2026-09-30',
      numberOfPeople: 2,
      status: 'CONFIRMED',
    },
    {
      id: 2,
      clientId: 2,
      checkInDate: '2026-09-28',
      checkOutDate: '2026-10-01',
      numberOfPeople: 2,
      status: 'CONFIRMED',
    },
    {
      id: 3,
      clientId: 3,
      checkInDate: '2026-09-29',
      checkOutDate: '2026-10-02',
      numberOfPeople: 2,
      status: 'CONFIRMED',
    },
    {
      id: 4,
      clientId: 4,
      checkInDate: '2026-09-30',
      checkOutDate: '2026-10-03',
      numberOfPeople: 2,
      status: 'CONFIRMED',
    },
    {
      id: 5,
      clientId: 5,
      checkInDate: '2026-10-01',
      checkOutDate: '2026-10-04',
      numberOfPeople: 2,
      status: 'CONFIRMED',
    },
  ];
}
