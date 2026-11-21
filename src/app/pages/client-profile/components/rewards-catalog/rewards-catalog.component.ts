import { Component, computed, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoyaltyTierName } from '../../../../models/client.model';
import { LoyaltySummaryDTO, RewardDTO } from '../../../../models/loyalty.model';
import { RewardCardComponent } from '../reward-card/reward-card.component';
import { ConfirmModalComponent } from '../../../../components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-rewards-catalog',
  standalone: true,
  imports: [CommonModule, RewardCardComponent, ConfirmModalComponent],
  templateUrl: './rewards-catalog.component.html',
  styleUrl: './rewards-catalog.component.scss',
})
export class RewardsCatalogComponent {
  rewards = input.required<RewardDTO[]>();
  summary = input<LoyaltySummaryDTO | null>(null);
  redeemingRewardId = input<number | null>(null);
  canRedeemAction = input<boolean>(true);

  redeemRequested = output<RewardDTO>();
  viewRedeemedClicked = output<void>();

  selectedCategory = signal<string>('ALL');
  pendingReward = signal<RewardDTO | null>(null);

  categories = computed(() => {
    const unique = new Set<string>();
    for (const r of this.rewards()) {
      if (r.category) unique.add(r.category.toUpperCase());
    }
    return ['ALL', ...Array.from(unique)];
  });

  filteredRewards = computed(() => {
    const cat = this.selectedCategory();
    if (cat === 'ALL') return this.rewards();
    return this.rewards().filter(
      (r) => r.category?.toUpperCase() === cat,
    );
  });

  userPoints = computed(() => this.summary()?.points ?? 0);
  userTier = computed<LoyaltyTierName>(
    () => this.summary()?.tier ?? 'CLASSIC',
  );

  openConfirmModal(reward: RewardDTO): void {
    this.pendingReward.set(reward);
  }

  closeConfirmModal(): void {
    this.pendingReward.set(null);
  }

  confirmRedemption(): void {
    const target = this.pendingReward();
    if (!target) return;
    this.pendingReward.set(null);
    this.redeemRequested.emit(target);
  }

  categoryLabel(cat: string): string {
    if (cat === 'ALL') return 'Todas';
    if (cat === 'GASTRONOMIA') return 'Gastronomía';
    if (cat === 'ESTANCIA') return 'Estancias';
    if (cat === 'SPA') return 'Spa & Bienestar';
    return cat;
  }
}
