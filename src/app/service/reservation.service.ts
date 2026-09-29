import { Injectable } from '@angular/core';
import { Reservation } from '../models/reservation.model';
import { ClientService } from './client.service';

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  constructor(private clientService: ClientService) {}

  getReservations(): Reservation[] {
    return this.reservations;
  }

  getReservationById(id: number): Reservation | undefined {
    return this.reservations.find((item) => item.id === id);
  }

  private get reservations(): Reservation[] {
    return [
    {
      id: 1,
      client: this.clientService.getClientById(1)!,
      checkInDate: '2026-09-27',
      checkOutDate: '2026-09-30',
      numberOfPeople: 2,
      status: 'CONFIRMED',
    },
    {
      id: 2,
      client: this.clientService.getClientById(2)!,
      checkInDate: '2026-09-28',
      checkOutDate: '2026-10-01',
      numberOfPeople: 2,
      status: 'CONFIRMED',
    },
    {
      id: 3,
      client: this.clientService.getClientById(3)!,
      checkInDate: '2026-09-29',
      checkOutDate: '2026-10-02',
      numberOfPeople: 2,
      status: 'CONFIRMED',
    },
    {
      id: 4,
      client: this.clientService.getClientById(4)!,
      checkInDate: '2026-09-30',
      checkOutDate: '2026-10-03',
      numberOfPeople: 2,
      status: 'CONFIRMED',
    },
    {
      id: 5,
      client: this.clientService.getClientById(5)!,
      checkInDate: '2026-10-01',
      checkOutDate: '2026-10-04',
      numberOfPeople: 2,
      status: 'CONFIRMED',
    },
    ];
  }
}
