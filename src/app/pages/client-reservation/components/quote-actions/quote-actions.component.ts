import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-quote-actions',
  imports: [RouterLink],
  templateUrl: './quote-actions.component.html',
  styleUrl: './quote-actions.component.scss',
  standalone: true,
})
export class QuoteActionsComponent {
  isSubmitting = input.required<boolean>();
  isDisabled = input.required<boolean>();
  isEditMode = input.required<boolean>();
  clientId = input.required<number>();
}
