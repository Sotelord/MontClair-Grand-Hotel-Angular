import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-room-form-actions',
  imports: [RouterLink],
  templateUrl: './room-form-actions.component.html',
  styleUrl: './room-form-actions.component.scss',
  standalone: true,
})
export class RoomFormActionsComponent {
  isEditMode = input.required<boolean>();
}
