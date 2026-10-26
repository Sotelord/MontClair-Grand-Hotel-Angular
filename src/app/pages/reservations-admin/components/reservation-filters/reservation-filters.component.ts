import { Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reservation-filters',
  imports: [FormsModule],
  templateUrl: './reservation-filters.component.html',
  styleUrl: './reservation-filters.component.scss',
  standalone: true,
})
export class ReservationFiltersComponent {
  selectedStatus = model<string>('ALL');
  total = input.required<number>();
}
