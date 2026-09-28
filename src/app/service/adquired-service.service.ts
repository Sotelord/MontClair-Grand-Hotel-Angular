import { Injectable } from '@angular/core';
import { AcquiredService } from '../models/adquiredService.model';

@Injectable({
  providedIn: 'root',
})
export class AdquiredServiceService {
  constructor() {}

  getAcquiredServices(): AcquiredService[] {
    return this.acquiredServices;
  }

  getAcquiredServiceById(id: number): AcquiredService | undefined {
    return this.acquiredServices.find((item) => item.id === id);
  }

  private acquiredServices: AcquiredService[] = [
    {
      id: 1,
      reservationRoomId: 1,
      serviceId: 1,
      date: '2026-09-28',
      quantity: 2,
      unitPrice: 40.0,
    },
    {
      id: 2,
      reservationRoomId: 2,
      serviceId: 2,
      date: '2026-09-29',
      quantity: 2,
      unitPrice: 100.0,
    },
    {
      id: 3,
      reservationRoomId: 3,
      serviceId: 3,
      date: '2026-09-30',
      quantity: 2,
      unitPrice: 0.0,
    },
    {
      id: 4,
      reservationRoomId: 4,
      serviceId: 4,
      date: '2026-10-01',
      quantity: 2,
      unitPrice: 0.0,
    },
    {
      id: 5,
      reservationRoomId: 5,
      serviceId: 5,
      date: '2026-10-02',
      quantity: 2,
      unitPrice: 0.0,
    },
  ];
}
