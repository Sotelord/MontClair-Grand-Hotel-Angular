import { Highlight } from './highlight.model';

export interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  icon?: string;
  tag: string;
  schedule: string;
  priceLabel?: string;
  heroDescription?: string;
  tagline?: string;
  headline?: string;
  fullDescription?: string;
  scheduleNote?: string;
  priceNote?: string;
  secondaryImageUrl?: string;
  highlights: Highlight[];
  galleryImages: string[];
  hidden: boolean;
}
