import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-room-type-form-actions',
  imports: [RouterLink],
  templateUrl: './room-type-form-actions.component.html',
  styleUrl: './room-type-form-actions.component.scss',
  standalone: true,
})
export class RoomTypeFormActionsComponent {
  isEditMode = input.required<boolean>();
  isInvalid = input.required<boolean>();
}
