import { Component, input, output } from '@angular/core';
import { ReservationDTO } from '../../../../models/reservation.model';
import { ClientCellComponent } from '../client-cell/client-cell.component';
import { RoomCellComponent } from '../room-cell/room-cell.component';
import { DatesCellComponent } from '../dates-cell/dates-cell.component';
import { AccountCellComponent } from '../account-cell/account-cell.component';
import { RowActionsComponent } from '../row-actions/row-actions.component';

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
  viewRequested = output<number>();
  editRequested = output<number>();
  activateRequested = output<ReservationDTO>();
  payRequested = output<ReservationDTO>();
  finishRequested = output<ReservationDTO>();
  cancelRequested = output<ReservationDTO>();
  deleteRequested = output<ReservationDTO>();

  formatId(id: number): string {
    return '#' + String(id).padStart(3, '0');
  }
}
