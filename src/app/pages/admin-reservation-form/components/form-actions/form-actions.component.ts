import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-form-actions',
  imports: [RouterLink],
  templateUrl: './form-actions.component.html',
  styleUrl: './form-actions.component.scss',
  standalone: true,
})
export class FormActionsComponent {
  isSubmitting = input.required<boolean>();
  isInvalid = input.required<boolean>();
  isEditMode = input.required<boolean>();
}
