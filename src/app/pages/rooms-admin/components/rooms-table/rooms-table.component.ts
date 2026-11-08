import { Component, input, output } from '@angular/core';
import { RoomStatusBadgeComponent } from '../room-status-badge/room-status-badge.component';
import { Room } from '../../../../models/room.model';

@Component({
  selector: 'app-rooms-table',
  imports: [RoomStatusBadgeComponent],
  templateUrl: './rooms-table.component.html',
  styleUrl: './rooms-table.component.scss',
  standalone: true,
})
export class RoomsTableComponent {
  rooms = input.required<Room[]>();
  editRequested = output<number>();
  deleteRequested = output<Room>();

  readonly defaultImage =
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=400&q=80';

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  }

  formatId(id: number): string {
    return '#' + String(id).padStart(3, '0');
  }
}
