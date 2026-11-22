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

  /** Filtros que se pintan en la fila (antes eran 5 botones repetidos en el HTML) */
  readonly filters: { id: TransactionFilter; label: string }[] = [
    { id: 'ALL', label: 'Todas' },
    { id: 'EARN', label: 'Adiciones' },
    { id: 'REDEEM', label: 'Canjes' },
    { id: 'ADJUSTMENT_ADD', label: 'Bonificaciones' },
    { id: 'ADJUSTMENT_SUBTRACT', label: 'Restas' },
  ];

  filteredTransactions = computed(() => {
    const filter = this.activeFilter();
    if (filter === 'ALL') return this.transactions();
    return this.transactions().filter((tx) => tx.type === filter);
  });

  countByType(type: TransactionFilter): number {
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

  /** Colores de la etiqueta de tipo (se usa en la tabla y en la lista de celular) */
  typeBadgeClass(type: PointTransactionType): string {
    switch (type) {
      case 'EARN':
      case 'ADJUSTMENT_ADD':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'REDEEM':
        return 'bg-amber-50 text-amber-900 border-amber-200';
      case 'ADJUSTMENT_SUBTRACT':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-pampas text-woodsmoke/70 border-[#E8E2DA]';
    }
  }
}
