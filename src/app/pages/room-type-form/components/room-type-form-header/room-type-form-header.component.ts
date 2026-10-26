import { Component, input } from '@angular/core';
import { OrnamentDividerComponent } from '../../../../components/ornament-divider/ornament-divider.component';

@Component({
  selector: 'app-room-type-form-header',
  imports: [OrnamentDividerComponent],
  templateUrl: './room-type-form-header.component.html',
  styleUrl: './room-type-form-header.component.scss',
  standalone: true,
})
export class RoomTypeFormHeaderComponent {
  isEditMode = input.required<boolean>();
}
