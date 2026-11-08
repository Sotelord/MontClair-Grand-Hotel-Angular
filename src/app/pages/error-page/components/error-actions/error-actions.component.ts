import { Component, output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-error-actions',
  imports: [RouterLink],
  templateUrl: './error-actions.component.html',
  styleUrl: './error-actions.component.scss',
  standalone: true,
})
export class ErrorActionsComponent {
  backClicked = output<void>();
}
