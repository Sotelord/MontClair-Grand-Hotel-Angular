import { Component, input, output } from '@angular/core';
import { ReservationDTO } from '../../../../models/reservation.model';
import { NgClass } from '@angular/common';

/**
 * Acciones por fila en la tabla de administración de reservas:
 * - Ver detalle
 * - Editar reserva
 * - Activar estadía (Check-in: CONFIRMED -> ACTIVE)
 * - Pagar cuenta (Limpia la cuenta del cliente: paid = true)
 * - Finalizar estadía (Check-out: ACTIVE -> INACTIVE; requiere cuenta pagada)
 * - Cancelar reserva
 */
@Component({
  selector: 'app-row-actions',
  imports: [NgClass],
  templateUrl: './row-actions.component.html',
  styleUrl: './row-actions.component.scss',
  standalone: true,
})
export class RowActionsComponent {
  reservation = input.required<ReservationDTO>();

  viewClicked = output<void>();
  editClicked = output<void>();
  activateClicked = output<void>();
  payClicked = output<void>();
  finishClicked = output<void>();
  cancelClicked = output<void>();
  deleteClicked = output<void>();

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
