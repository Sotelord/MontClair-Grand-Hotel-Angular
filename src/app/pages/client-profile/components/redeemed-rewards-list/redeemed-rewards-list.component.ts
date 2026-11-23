import { Component, computed, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RedeemedRewardDTO, RedemptionStatus } from '../../../../models/loyalty.model';

type RedemptionFilter = 'ALL' | RedemptionStatus;

@Component({
  selector: 'app-redeemed-rewards-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './redeemed-rewards-list.component.html',
  styleUrl: './redeemed-rewards-list.component.scss',
})
export class RedeemedRewardsListComponent {
  redeemedRewards = input.required<RedeemedRewardDTO[]>();
  browseCatalogClicked = output<void>();

  activeFilter = signal<RedemptionFilter>('ALL');
  copiedCode = signal<string | null>(null);

  readonly fallbackImage =
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=400&q=80';

  filteredList = computed(() => {
    const filter = this.activeFilter();
    if (filter === 'ALL') return this.redeemedRewards();
    return this.redeemedRewards().filter((item) => item.status === filter);
  });

  activeCount = computed(
    () => this.redeemedRewards().filter((r) => r.status === 'ACTIVE').length,
  );

  usedCount = computed(
    () => this.redeemedRewards().filter((r) => r.status === 'USED').length,
  );

  copyCode(code: string): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
    this.copiedCode.set(code);
    setTimeout(() => {
      if (this.copiedCode() === code) {
        this.copiedCode.set(null);
      }
    }, 2500);
  }

  statusLabel(status: RedemptionStatus): string {
    switch (status) {
      case 'ACTIVE':
        return 'Disponible para usar';
      case 'USED':
        return 'Utilizado';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return status;
    }
  }
}
