import { Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RoomType } from '../../../../models/roomType.model';

@Component({
  selector: 'app-room-type-selector',
  imports: [ReactiveFormsModule],
  templateUrl: './room-type-selector.component.html',
  styleUrl: './room-type-selector.component.scss',
  standalone: true,
})
export class RoomTypeSelectorComponent {
  form = input.required<FormGroup>();
  roomTypes = input.required<RoomType[]>();

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  }
}
