import { Component, input } from '@angular/core';
import { Room } from '../../../../models/room.model';

@Component({
  selector: 'app-room-section',
  imports: [],
  templateUrl: './room-section.component.html',
  styleUrl: './room-section.component.scss',
  standalone: true,
})
export class RoomSectionComponent {
  room = input<Room | null>(null);
  pricePerNight = input.required<number>();

  readonly fallbackImage =
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=600&q=80';

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  }
}
