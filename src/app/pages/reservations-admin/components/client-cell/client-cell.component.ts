import { Component, input } from '@angular/core';
import { ReservationDTO } from '../../../../models/reservation.model';

@Component({
  selector: 'app-client-cell',
  imports: [],
  templateUrl: './client-cell.component.html',
  styleUrl: './client-cell.component.scss',
  standalone: true,
})
export class ClientCellComponent {
  reservation = input.required<ReservationDTO>();
}
