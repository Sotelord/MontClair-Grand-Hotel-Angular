import { Component, input } from '@angular/core';
import { ReservationDTO } from '../../../../models/reservation.model';

@Component({
  selector: 'app-dates-cell',
  imports: [],
  templateUrl: './dates-cell.component.html',
  styleUrl: './dates-cell.component.scss',
  standalone: true,
})
export class DatesCellComponent {
  reservation = input.required<ReservationDTO>();
}
