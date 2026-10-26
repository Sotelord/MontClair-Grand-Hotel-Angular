import { Component, input } from '@angular/core';
import { ReservationDTO } from '../../../../models/reservation.model';

@Component({
  selector: 'app-room-cell',
  imports: [],
  templateUrl: './room-cell.component.html',
  styleUrl: './room-cell.component.scss',
  standalone: true,
})
export class RoomCellComponent {
  reservation = input.required<ReservationDTO>();

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  }
}
