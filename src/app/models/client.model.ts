export type LoyaltyTierName = 'CLASSIC' | 'PRIVILEGE' | 'IMPERIAL';

export interface Client {
  id: number;
  username: string;
  password?: string;
  email: string;
  firstName: string;
  lastName?: string;
  avatarUrl?: string;
  phone?: string;
  role: string;
  points?: number;
  lifetimePoints?: number;
  loyaltyTier?: LoyaltyTierName;
  loyaltyTierLabel?: string;
}
