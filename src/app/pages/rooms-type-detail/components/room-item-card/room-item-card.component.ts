import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Room } from '../../../../models/room.model';

@Component({
  selector: 'app-room-item-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './room-item-card.component.html',
  styleUrl: './room-item-card.component.scss',
})
export class RoomItemCardComponent {
  room = input.required<Room>();

  getImageUrl(): string {
    const r = this.room();
    return (
      r.secondaryImageUrl ||
      r.imageUrl ||
      r.roomType?.imageUrl ||
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80'
    );
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(price || 0);
  }
}
