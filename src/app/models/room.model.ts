import { Highlight } from './highlight.model';
import { RoomType } from './roomType.model';

export type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';

export interface Room {
  id: number;
  number: string;
  floor: number;
  roomType: RoomType;
  status: RoomStatus;
  name?: string;
  capacity: number;
  bedType?: string;
  area: number;
  pricePerNight: number;
  heroDescription?: string;
  headline?: string;
  fullDescription?: string;
  secondaryImageUrl?: string;
  imageUrl?: string;
  highlights: Highlight[];
  galleryImages: string[];
}
