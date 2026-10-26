import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-detail-not-found',
  imports: [],
  templateUrl: './detail-not-found.component.html',
  styleUrl: './detail-not-found.component.scss',
  standalone: true,
})
export class DetailNotFoundComponent {
  message = input<string | null>(null);
  backClicked = output<void>();
}
