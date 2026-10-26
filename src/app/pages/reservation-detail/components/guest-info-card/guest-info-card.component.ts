import { Component, input } from '@angular/core';
import { Reservation, ReservationDTO } from '../../../../models/reservation.model';

@Component({
  selector: 'app-guest-info-card',
  imports: [],
  templateUrl: './guest-info-card.component.html',
  styleUrl: './guest-info-card.component.scss',
  standalone: true,
})
export class GuestInfoCardComponent {
  reservation = input.required<Reservation | ReservationDTO>();
}
