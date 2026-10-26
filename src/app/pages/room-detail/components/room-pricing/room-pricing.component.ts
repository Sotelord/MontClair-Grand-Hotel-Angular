import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Room } from '../../../../models/room.model';

@Component({
  selector: 'app-room-pricing',
  imports: [RouterLink],
  templateUrl: './room-pricing.component.html',
  styleUrl: './room-pricing.component.scss',
  standalone: true,
})
export class RoomPricingComponent {
  room = input.required<Room>();

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  }
}
