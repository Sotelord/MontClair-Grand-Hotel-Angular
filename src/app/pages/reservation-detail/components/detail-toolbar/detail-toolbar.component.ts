import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-detail-toolbar',
  imports: [RouterLink],
  templateUrl: './detail-toolbar.component.html',
  styleUrl: './detail-toolbar.component.scss',
  standalone: true,
})
export class DetailToolbarComponent {
  reservationId = input<number | null>(null);
  isAdminView = input.required<boolean>();
  backClicked = output<void>();
}
