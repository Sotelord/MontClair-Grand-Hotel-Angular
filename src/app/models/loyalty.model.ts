import { LoyaltyTierName } from './client.model';

export type PointTransactionType =
  | 'EARN'
  | 'REDEEM'
  | 'ADJUSTMENT_ADD'
  | 'ADJUSTMENT_SUBTRACT';

export type RedemptionStatus = 'ACTIVE' | 'USED' | 'CANCELLED';

export interface LoyaltySummaryDTO {
  clientId: number;
  clientName: string;
  points: number;
  lifetimePoints: number;
  tier: LoyaltyTierName;
  tierLabel: string;
  pointsMultiplier: number;
  nextTier: LoyaltyTierName | null;
  nextTierLabel: string | null;
  pointsToNextTier: number;
  progressPercentage: number;
  totalEarned: number;
  totalSpent: number;
  redeemedCount: number;
}

export interface RewardDTO {
  id: number;
  name: string;
  description: string;
  category: string;
  pointsCost: number;
  minimumTier: LoyaltyTierName;
  minimumTierLabel: string;
  imageUrl?: string;
  stock: number | null;
  active: boolean;
  available: boolean;
}

export interface RewardRequestDTO {
  name: string;
  description?: string;
  category: string;
  pointsCost: number;
  minimumTier?: LoyaltyTierName;
  imageUrl?: string;
  stock?: number | null;
  active?: boolean;
}

export interface RedeemedRewardDTO {
  id: number;
  clientId: number;
  clientName: string;
  rewardId: number;
  rewardName: string;
  rewardDescription: string;
  rewardCategory: string;
  rewardImageUrl?: string;
  pointsSpent: number;
  redemptionCode: string;
  status: RedemptionStatus;
  redeemedAt: string;
  usedAt?: string | null;
}

export interface PointTransactionDTO {
  id: number;
  clientId: number;
  type: PointTransactionType;
  pointsDelta: number;
  balanceAfter: number;
  description: string;
  referenceId?: number | null;
  referenceType?: string | null;
  createdAt: string;
}

export interface PointAdjustmentRequestDTO {
  points: number;
  operation: 'ADD' | 'SUBTRACT';
  description?: string;
}
