import { Component, input } from '@angular/core';

@Component({
  selector: 'app-account-summary',
  imports: [],
  templateUrl: './account-summary.component.html',
  styleUrl: './account-summary.component.scss',
  standalone: true,
})
export class AccountSummaryComponent {
  nightsCount = input.required<number>();
  roomSubtotal = input.required<number>();
  servicesSubtotal = input.required<number>();
  grandTotal = input.required<number>();

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  }
}
