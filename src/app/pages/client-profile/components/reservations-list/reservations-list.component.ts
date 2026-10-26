import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Reservation } from '../../../../models/reservation.model';
import { ReservationCardComponent } from '../reservation-card/reservation-card.component';

@Component({
  selector: 'app-reservations-list',
  imports: [RouterLink, ReservationCardComponent],
  templateUrl: './reservations-list.component.html',
  styleUrl: './reservations-list.component.scss',
  standalone: true,
})
export class ReservationsListComponent {
  reservations = input.required<Reservation[]>();
  clientId = input.required<number>();
  deletingIds = input.required<Set<number>>();
  deleteRequested = output<Reservation>();
}
