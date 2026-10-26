import { Component, input } from '@angular/core';
import { RoomType } from '../../../../models/roomType.model';

@Component({
  selector: 'app-quote-summary',
  imports: [],
  templateUrl: './quote-summary.component.html',
  styleUrl: './quote-summary.component.scss',
  standalone: true,
})
export class QuoteSummaryComponent {
  selectedRoomType = input<RoomType | null>(null);
  nightsCount = input.required<number>();
  roomTotal = input.required<number>();
  servicesCount = input.required<number>();
  servicesTotal = input.required<number>();
  grandTotal = input.required<number>();

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  }
}
