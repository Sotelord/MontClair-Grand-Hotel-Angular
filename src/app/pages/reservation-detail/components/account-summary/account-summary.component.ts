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
  paid = input<boolean>(false);
  paidAmount = input<number>(0);
  pendingBalance = input<number>(0);

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  }
}
