import { Component, input } from '@angular/core';
import { ReservationDTO } from '../../../../models/reservation.model';

@Component({
  selector: 'app-account-cell',
  imports: [],
  templateUrl: './account-cell.component.html',
  styleUrl: './account-cell.component.scss',
  standalone: true,
})
export class AccountCellComponent {
  reservation = input.required<ReservationDTO>();

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  }
}
