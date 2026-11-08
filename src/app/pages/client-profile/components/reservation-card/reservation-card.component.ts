import { Component, input, output } from '@angular/core';
import { ReservationDTO } from '../../../../models/reservation.model';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';

/**
 * Componente de tarjeta de reserva individual dentro del historial del cliente.
 * Muestra el estado del ciclo de vida (Confirmada, Activa, Finalizada, Cancelada),
 * el estado financiero de la cuenta (Pagada / Pendiente) y acciones según corresponda.
 */
@Component({
  selector: 'app-reservation-card',
  imports: [NgClass, RouterLink],
  templateUrl: './reservation-card.component.html',
  styleUrl: './reservation-card.component.scss',
  standalone: true,
})
export class ReservationCardComponent {
  reservation = input.required<ReservationDTO>();
  isCancelling = input.required<boolean>();
  cancelRequested = output<ReservationDTO>();

  get roomName(): string {
    const res = this.reservation();
    return (
      res.roomName ||
      res.reservationRooms?.[0]?.room?.name ||
      'Habitación Reservada'
    );
  }

  get roomNumber(): string {
    const res = this.reservation();
    return (
      res.roomNumber ||
      res.reservationRooms?.[0]?.room?.number ||
      ''
    );
  }

  get roomTypeName(): string {
    const res = this.reservation();
    return (
      res.roomTypeName ||
      res.reservationRooms?.[0]?.room?.roomType?.name ||
      'Categoría Premium'
    );
  }

  get roomPrice(): number {
    const res = this.reservation();
    return (
      res.pricePerNight ||
      res.reservationRooms?.[0]?.pricePerNight ||
      0
    );
  }

  get servicesList(): Array<{ name: string; quantity: number; unitPrice: number }> {
    const res = this.reservation();
    if (res.services && res.services.length > 0) {
      return res.services.map((s) => ({
        name: s.name,
        quantity: s.quantity,
        unitPrice: s.unitPrice,
      }));
    }
    const acq = res.reservationRooms?.[0]?.acquiredServices;
    if (acq && acq.length > 0) {
      return acq.map((s: any) => ({
        name: s.service?.name || 'Servicio',
        quantity: s.quantity,
        unitPrice: s.unitPrice,
      }));
    }
    return [];
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(price || 0);
  }
  /**
   * REGLA 4: Solo se pueden cancelar reservas que todavia no estan activas,
   * es decir que su fecha de inicio es posterior a la fecha actual.
   */
  get isCancelable(): boolean {
    const res = this.reservation();
    if (!res || res.status !== 'CONFIRMED' || !res.checkInDate) {
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const parts = res.checkInDate.split('-').map(Number);
    const checkIn = new Date(parts[0], parts[1] - 1, parts[2]);
    return checkIn.getTime() > today.getTime();
  }
}
