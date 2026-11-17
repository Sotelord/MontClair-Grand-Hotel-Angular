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

  get guestFullName(): string {
    const res = this.reservation() as ReservationDTO & Partial<Reservation>;
    const first = res.clientFirstName || res.client?.firstName || '';
    const last = res.clientLastName || res.client?.lastName || '';
    return `${first} ${last}`.trim();
  }

  get guestEmail(): string {
    const res = this.reservation() as ReservationDTO & Partial<Reservation>;
    return res.clientEmail || res.client?.email || '';
  }

  get guestPhone(): string {
    const res = this.reservation() as ReservationDTO & Partial<Reservation>;
    return res.clientPhone || res.client?.phone || 'No especificado';
  }

  get guestId(): number | string {
    const res = this.reservation() as ReservationDTO & Partial<Reservation>;
    return res.clientId ?? res.client?.id ?? '';
  }
}
