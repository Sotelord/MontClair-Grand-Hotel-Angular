import { Component, input, output } from '@angular/core';
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
  allowRemoveService = input<boolean>(false);
  removeServiceClicked = output<{ id: number; name: string }>();

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  }
}
