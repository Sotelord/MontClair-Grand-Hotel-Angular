export interface TouristPlace {
  id: number;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  longDescription: string;
  category: string;
  imageUrls: string[];
  imageAttributions: string[];
  address: string;
  latitude: number;
  longitude: number;
  suggestedDurationMinutes: number;
  displayOrder: number;
  googleMapsUrl: string;
}

export interface ItineraryStop {
  id: number;
  place: TouristPlace;
  addedAt: string;
}

export type TouristTransportMode = 'WALKING' | 'DRIVING';

export interface TouristRouteVisit {
  type: 'HOTEL' | 'DESTINATION';
  visitOrder: number | null;
  placeId: number | null;
  name: string;
  latitude: number;
  longitude: number;
  suggestedDurationMinutes: number | null;
  googleMapsUrl: string;
}

export interface OptimizedTourRoute {
  mode: TouristTransportMode;
  returnToHotel: boolean;
  distanceMeters: number;
  durationSeconds: number;
  visits: TouristRouteVisit[];
  geometry: number[][];
  geometryType: string;
  googleMapsUrl: string;
  optimizationNote: string;
}
