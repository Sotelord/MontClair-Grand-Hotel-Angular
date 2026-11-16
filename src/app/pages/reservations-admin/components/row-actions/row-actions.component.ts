import { Component, inject, input, output } from '@angular/core';
import { ReservationDTO } from '../../../../models/reservation.model';
import { NgClass } from '@angular/common';
import {
  downloadReservationPdf,
  loadReservationPdfRoom,
} from '../../../../utils/reservation-pdf';
import { RoomService } from '../../../../service/room.service';
import { RoomTypeService } from '../../../../service/room-type.service';

@Component({
  selector: 'app-row-actions',
  imports: [NgClass],
  templateUrl: './row-actions.component.html',
  styleUrl: './row-actions.component.scss',
  standalone: true,
})
export class RowActionsComponent {
  private roomService = inject(RoomService);
  private roomTypeService = inject(RoomTypeService);

  reservation = input.required<ReservationDTO>();
  isOperatorMode = input<boolean>(false);

  viewClicked = output<void>();
  editClicked = output<void>();
  activateClicked = output<void>();
  addServiceClicked = output<void>();
  payClicked = output<void>();
  finishClicked = output<void>();
  cancelClicked = output<void>();
  deleteClicked = output<void>();

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
