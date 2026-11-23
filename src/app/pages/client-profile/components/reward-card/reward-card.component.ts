import { Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoyaltyTierName } from '../../../../models/client.model';
import { RewardDTO } from '../../../../models/loyalty.model';

const TIER_ORDER: Record<LoyaltyTierName, number> = {
  CLASSIC: 0,
  PRIVILEGE: 1,
  IMPERIAL: 2,
};

@Component({
  selector: 'app-reward-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reward-card.component.html',
  styleUrl: './reward-card.component.scss',
})
export class RewardCardComponent {
  reward = input.required<RewardDTO>();
  userPoints = input<number>(0);
  userTier = input<LoyaltyTierName>('CLASSIC');
  isRedeeming = input<boolean>(false);
  canRedeemAction = input<boolean>(true);

  redeemClicked = output<RewardDTO>();

  readonly fallbackImage =
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80';

  meetsTier = computed(() => {
    const current = TIER_ORDER[this.userTier()] ?? 0;
    const required = TIER_ORDER[this.reward().minimumTier] ?? 0;
    return current >= required;
  });

  hasEnoughPoints = computed(
    () => this.userPoints() >= (this.reward().pointsCost || 0),
  );

  missingPoints = computed(() =>
    Math.max(0, (this.reward().pointsCost || 0) - this.userPoints()),
  );

  canRedeem = computed(
    () =>
      this.canRedeemAction() &&
      this.reward().available &&
      this.meetsTier() &&
      this.hasEnoughPoints() &&
      !this.isRedeeming(),
  );

  buttonLabel = computed(() => {
    if (this.isRedeeming()) return 'Canjeando...';
    if (!this.reward().available) return 'Agotada';
    if (!this.meetsTier()) return `Requiere ${this.reward().minimumTierLabel}`;
    if (!this.hasEnoughPoints()) {
      return `Faltan ${this.missingPoints().toLocaleString()} pts`;
    }
    return 'Canjear Recompensa';
  });
}
