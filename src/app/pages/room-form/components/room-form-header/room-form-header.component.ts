import { Component, input } from '@angular/core';
import { OrnamentDividerComponent } from '../../../../components/ornament-divider/ornament-divider.component';

@Component({
  selector: 'app-room-form-header',
  imports: [OrnamentDividerComponent],
  templateUrl: './room-form-header.component.html',
  styleUrl: './room-form-header.component.scss',
  standalone: true,
})
export class RoomFormHeaderComponent {
  isEditMode = input.required<boolean>();
}
