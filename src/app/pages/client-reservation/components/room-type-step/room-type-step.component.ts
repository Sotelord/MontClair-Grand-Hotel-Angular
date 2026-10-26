import { Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RoomType } from '../../../../models/roomType.model';

@Component({
  selector: 'app-room-type-step',
  imports: [ReactiveFormsModule],
  templateUrl: './room-type-step.component.html',
  styleUrl: './room-type-step.component.scss',
  standalone: true,
})
export class RoomTypeStepComponent {
  form = input.required<FormGroup>();
  roomTypes = input.required<RoomType[]>();
  selectedRoomType = input<RoomType | null>(null);

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  }
}
