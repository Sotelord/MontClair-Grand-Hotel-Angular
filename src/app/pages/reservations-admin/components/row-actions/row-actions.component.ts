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
}
