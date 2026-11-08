import { Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';

/**
 * Componente de filtros para el panel de administración de reservas.
 * Permite filtrar por estado de reserva (Confirmada, Activa, Inactiva, Cancelada)
 * y por estado de pago de la cuenta (Todos, Pagada, Pendiente).
 */
@Component({
  selector: 'app-reservation-filters',
  imports: [FormsModule],
  templateUrl: './reservation-filters.component.html',
  styleUrl: './reservation-filters.component.scss',
  standalone: true,
})
export class ReservationFiltersComponent {
  selectedStatus = model<string>('ALL');
  selectedPayment = model<string>('ALL');
  total = input.required<number>();
}
