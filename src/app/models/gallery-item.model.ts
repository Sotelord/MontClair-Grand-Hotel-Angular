export interface GalleryItem {
  id: number;
  title: string;
  category: 'exteriores' | 'suites' | 'gastronomia' | 'spa' | 'eventos';
  categoryLabel: string;
  imageUrl: string;
  description: string;
  isWide?: boolean;
}
