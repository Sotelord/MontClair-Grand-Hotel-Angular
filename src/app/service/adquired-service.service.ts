import { Injectable } from '@angular/core';
import { AcquiredService } from '../models/adquiredService.model';
import { ReservationRoomService } from './reservation-room.service';
import { ServicesService } from './services.service';

@Injectable({
  providedIn: 'root',
})
export class AdquiredServiceService {
  constructor(
    private reservationRoomService: ReservationRoomService,
    private servicesService: ServicesService,
  ) {}

  getAcquiredServices(): AcquiredService[] {
    return this.acquiredServices;
  }

  getAcquiredServiceById(id: number): AcquiredService | undefined {
    return this.acquiredServices.find((item) => item.id === id);
  }

  private get acquiredServices(): AcquiredService[] {
    return [
    {
      id: 1,
      reservationRoom: this.reservationRoomService.getReservationRoomById(1)!,
      service: this.servicesService.getServiceById(1)!,
      date: '2026-09-28',
      quantity: 2,
      unitPrice: 40.0,
    },
    {
      id: 2,
      reservationRoom: this.reservationRoomService.getReservationRoomById(2)!,
      service: this.servicesService.getServiceById(2)!,
      date: '2026-09-29',
      quantity: 2,
      unitPrice: 100.0,
    },
    {
      id: 3,
      reservationRoom: this.reservationRoomService.getReservationRoomById(3)!,
      service: this.servicesService.getServiceById(3)!,
      date: '2026-09-30',
      quantity: 2,
      unitPrice: 0.0,
    },
    {
      id: 4,
      reservationRoom: this.reservationRoomService.getReservationRoomById(4)!,
      service: this.servicesService.getServiceById(4)!,
      date: '2026-10-01',
      quantity: 2,
      unitPrice: 0.0,
    },
    {
      id: 5,
      reservationRoom: this.reservationRoomService.getReservationRoomById(5)!,
      service: this.servicesService.getServiceById(5)!,
      date: '2026-10-02',
      quantity: 2,
      unitPrice: 0.0,
    },
    ];
  }
}
