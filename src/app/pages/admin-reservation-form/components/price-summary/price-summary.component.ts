import { Component, input } from '@angular/core';

@Component({
  selector: 'app-price-summary',
  imports: [],
  templateUrl: './price-summary.component.html',
  styleUrl: './price-summary.component.scss',
  standalone: true,
})
export class PriceSummaryComponent {
  nightsCount = input.required<number>();
  roomPrice = input.required<number>();
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
