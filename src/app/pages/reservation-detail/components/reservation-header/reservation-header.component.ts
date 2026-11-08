import { Component, input } from '@angular/core';

@Component({
  selector: 'app-reservation-header',
  imports: [],
  templateUrl: './reservation-header.component.html',
  styleUrl: './reservation-header.component.scss',
  standalone: true,
})
export class ReservationHeaderComponent {
  reservationId = input.required<number>();
  status = input.required<string>();
  paid = input<boolean>(false);
}
