import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-edit-actions',
  imports: [RouterLink],
  templateUrl: './edit-actions.component.html',
  styleUrl: './edit-actions.component.scss',
  standalone: true,
})
export class EditActionsComponent {
  isSubmitting = input.required<boolean>();
  clientId = input.required<number>();
}
