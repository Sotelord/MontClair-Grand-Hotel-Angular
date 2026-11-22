import { Component, input, output } from '@angular/core';
import { ReservationDTO } from '../../../../models/reservation.model';
import { ClientCellComponent } from '../client-cell/client-cell.component';
import { RoomCellComponent } from '../room-cell/room-cell.component';
import { DatesCellComponent } from '../dates-cell/dates-cell.component';
import { AccountCellComponent } from '../account-cell/account-cell.component';
import { RowActionsComponent } from '../row-actions/row-actions.component';

interface StatusStyle {
  label: string;
  badge: string;
  dot: string;
}

@Component({
  selector: 'app-reservations-table',
  imports: [
    ClientCellComponent,
    RoomCellComponent,
    DatesCellComponent,
    AccountCellComponent,
    RowActionsComponent,
  ],
  templateUrl: './reservations-table.component.html',
  styleUrl: './reservations-table.component.scss',
  standalone: true,
})
export class ReservationsTableComponent {
  reservations = input.required<ReservationDTO[]>();
  isOperatorMode = input<boolean>(false);

  viewRequested = output<number>();
  editRequested = output<number>();
  activateRequested = output<ReservationDTO>();
  addServiceRequested = output<ReservationDTO>();
  removeServiceRequested = output<{
    reservation: ReservationDTO;
    serviceId: number;
    serviceName: string;
  }>();
  payRequested = output<ReservationDTO>();
  finishRequested = output<ReservationDTO>();
  cancelRequested = output<ReservationDTO>();
  deleteRequested = output<ReservationDTO>();

  formatId(id: number): string {
    return '#' + String(id).padStart(3, '0');
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(price || 0);
  }

  statusStyle(status: string): StatusStyle {
    switch (status) {
      case 'ACTIVE':
        return {
          label: 'Activa',
          badge:
            'status-activa bg-emerald-50 text-emerald-800 border-emerald-300',
          dot: 'bg-emerald-600 animate-pulse',
        };
      case 'INACTIVE':
        return {
          label: 'Inactiva',
          badge: 'status-inactiva bg-slate-100 text-slate-700 border-slate-300',
          dot: 'bg-slate-500',
        };
      case 'CANCELLED':
        return {
          label: 'Cancelada',
          badge: 'bg-rose-50 text-rose-700 border-rose-300',
          dot: 'bg-rose-500',
        };
      default:
        return {
          label: 'Confirmada',
          badge: 'bg-blue-50 text-blue-800 border-blue-200',
          dot: 'bg-blue-600',
        };
    }
  }
}
