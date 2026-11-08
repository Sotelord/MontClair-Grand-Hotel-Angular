import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-client-form-actions',
  imports: [RouterLink],
  templateUrl: './client-form-actions.component.html',
  styleUrl: './client-form-actions.component.scss',
  standalone: true,
})
export class ClientFormActionsComponent {
  isEditMode = input.required<boolean>();
  isAdminView = input.required<boolean>();
}
