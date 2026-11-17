import { Component, inject, input, output } from '@angular/core';
import { ReservationDTO } from '../../../../models/reservation.model';
import { NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  downloadReservationPdf,
  loadReservationPdfRoom,
} from '../../../../utils/reservation-pdf';
import { RoomService } from '../../../../service/room.service';
import { RoomTypeService } from '../../../../service/room-type.service';

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
  private roomService = inject(RoomService);
  private roomTypeService = inject(RoomTypeService);

  reservation = input.required<ReservationDTO>();
  isCancelling = input.required<boolean>();
  isPaying = input<boolean>(false);
  cancelRequested = output<ReservationDTO>();
  payRequested = output<ReservationDTO>();

  get roomName(): string {
    const res = this.reservation();
    return res.roomName || 'Habitación Reservada';
  }

  get roomNumber(): string {
    const res = this.reservation();
    return res.roomNumber || '';
  }

  get roomTypeName(): string {
    const res = this.reservation();
    return res.roomTypeName || 'Categoría Premium';
  }

  get roomPrice(): number {
    const res = this.reservation();
    return res.pricePerNight || 0;
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
    return [];
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(price || 0);
  }

  async generatePdf(): Promise<void> {
    const reservation = this.reservation();
    try {
      const room = await loadReservationPdfRoom(
        reservation,
        this.roomService,
        this.roomTypeService,
      );
      await downloadReservationPdf(reservation, room);
    } catch (error) {
      console.error('No fue posible preparar los datos de habitación.', error);
      await downloadReservationPdf(reservation);
    }
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
