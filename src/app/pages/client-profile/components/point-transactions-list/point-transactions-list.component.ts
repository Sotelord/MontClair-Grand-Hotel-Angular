import { Component, computed, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  LoyaltySummaryDTO,
  PointTransactionDTO,
  PointTransactionType,
} from '../../../../models/loyalty.model';

type TransactionFilter = 'ALL' | PointTransactionType;

@Component({
  selector: 'app-point-transactions-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './point-transactions-list.component.html',
  styleUrl: './point-transactions-list.component.scss',
})
export class PointTransactionsListComponent {
  transactions = input.required<PointTransactionDTO[]>();
  summary = input<LoyaltySummaryDTO | null>(null);

  activeFilter = signal<TransactionFilter>('ALL');

  filteredTransactions = computed(() => {
    const filter = this.activeFilter();
    if (filter === 'ALL') return this.transactions();
    return this.transactions().filter((tx) => tx.type === filter);
  });

  countByType(type: PointTransactionType): number {
    return this.transactions().filter((tx) => tx.type === type).length;
  }

  typeLabel(type: PointTransactionType): string {
    switch (type) {
      case 'EARN':
        return 'Adición';
      case 'REDEEM':
        return 'Canje';
      case 'ADJUSTMENT_ADD':
        return 'Bonificación';
      case 'ADJUSTMENT_SUBTRACT':
        return 'Descuento';
      default:
        return type;
    }
  }
}
