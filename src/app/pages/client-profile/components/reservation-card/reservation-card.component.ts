import { Component, inject, input, OnInit, output, signal } from '@angular/core';
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
 * Incluye fotografía de la suite, estado del ciclo de vida, desglose financiero y barra de acciones.
 */
@Component({
  selector: 'app-reservation-card',
  imports: [NgClass, RouterLink],
  templateUrl: './reservation-card.component.html',
  styleUrl: './reservation-card.component.scss',
  standalone: true,
})
export class ReservationCardComponent implements OnInit {
  private roomService = inject(RoomService);
  private roomTypeService = inject(RoomTypeService);

  reservation = input.required<ReservationDTO>();
  isCancelling = input.required<boolean>();
  isPaying = input<boolean>(false);
  cancelRequested = output<ReservationDTO>();
  payRequested = output<ReservationDTO>();

  roomImageUrl = signal<string>('');

  private static readonly FALLBACK_IMAGES: Record<string, string> = {
    DELUXE:
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=900&q=80',
    PREMIUM:
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=900&q=80',
    GRAND:
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80',
    ROYALE:
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=900&q=80',
    SUITE:
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=900&q=80',
    DEFAULT:
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=900&q=80',
  };

  ngOnInit(): void {
    const res = this.reservation();
    this.roomImageUrl.set(this.resolveDefaultImage(res));

    if (res?.roomId) {
      this.roomService.findById(res.roomId).subscribe({
        next: (room) => {
          const img =
            room?.secondaryImageUrl ||
            room?.imageUrl ||
            room?.roomType?.imageUrl;
          if (img) {
            this.roomImageUrl.set(img);
          }
        },
        error: () => {},
      });
    }
  }

  onImageError(): void {
    this.roomImageUrl.set(ReservationCardComponent.FALLBACK_IMAGES['DEFAULT']);
  }

  private resolveDefaultImage(res: ReservationDTO): string {
    const label = `${res?.roomName || ''} ${res?.roomTypeName || ''}`.toUpperCase();
    if (label.includes('ROYALE') || label.includes('PRESIDENTIAL')) {
      return ReservationCardComponent.FALLBACK_IMAGES['ROYALE'];
    }
    if (label.includes('GRAND')) {
      return ReservationCardComponent.FALLBACK_IMAGES['GRAND'];
    }
    if (label.includes('PREMIUM')) {
      return ReservationCardComponent.FALLBACK_IMAGES['PREMIUM'];
    }
    if (label.includes('SUITE')) {
      return ReservationCardComponent.FALLBACK_IMAGES['SUITE'];
    }
    if (label.includes('DELUXE')) {
      return ReservationCardComponent.FALLBACK_IMAGES['DELUXE'];
    }
    return ReservationCardComponent.FALLBACK_IMAGES['DEFAULT'];
  }

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
