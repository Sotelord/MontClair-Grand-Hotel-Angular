import { Component, input, output } from '@angular/core';
import { ReservationDTO } from '../../../../models/reservation.model';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-row-actions',
  imports: [NgClass],
  templateUrl: './row-actions.component.html',
  styleUrl: './row-actions.component.scss',
  standalone: true,
})
export class RowActionsComponent {
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
