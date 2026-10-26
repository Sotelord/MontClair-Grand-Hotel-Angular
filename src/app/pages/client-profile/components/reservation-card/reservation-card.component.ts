import { Component, input, output } from '@angular/core';
import { Reservation } from '../../../../models/reservation.model';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-reservation-card',
  imports: [NgClass, RouterLink],
  templateUrl: './reservation-card.component.html',
  styleUrl: './reservation-card.component.scss',
  standalone: true,
})
export class ReservationCardComponent {
  reservation = input.required<Reservation>();
  isDeleting = input.required<boolean>();
  deleteRequested = output<Reservation>();

  get firstRoom() {
    return this.reservation().reservationRooms?.[0];
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  }
}
