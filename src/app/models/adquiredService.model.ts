import { ReservationRoom } from './reservationRoom.model';
import { Service } from './service.model';

export interface AcquiredService {
  id: number;
  reservationRoom: ReservationRoom;
  service: Service;
  date: string;
  quantity: number;
  unitPrice: number;
}
