import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-booking-breadcrumb',
  imports: [RouterLink],
  templateUrl: './booking-breadcrumb.component.html',
  styleUrl: './booking-breadcrumb.component.scss',
  standalone: true,
})
export class BookingBreadcrumbComponent {
  isEditMode = input.required<boolean>();
  reservationId = input<number | undefined>();
}
