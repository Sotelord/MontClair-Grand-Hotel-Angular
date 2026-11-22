import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  ItineraryStop,
  OptimizedTourRoute,
  TouristPlace,
  TouristTransportMode,
} from '../models/tourism.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TourismService {
  private readonly http = inject(HttpClient);
  private readonly catalogUrl = `${environment.apiUrl}/tourist-places`;
  private readonly tourismUrl = `${environment.apiUrl}/tourism`;

  getPlaces(category?: string): Observable<TouristPlace[]> {
    let params = new HttpParams();
    if (category) {
      params = params.set('category', category);
    }
    return this.http.get<TouristPlace[]>(this.catalogUrl, { params });
  }

  getMyItinerary(): Observable<ItineraryStop[]> {
    return this.http.get<ItineraryStop[]>(`${this.tourismUrl}/itinerary`);
  }

  addToMyItinerary(placeId: number): Observable<ItineraryStop> {
    return this.http.post<ItineraryStop>(
      `${this.tourismUrl}/itinerary/${placeId}`,
      {},
    );
  }

  removeFromMyItinerary(placeId: number): Observable<void> {
    return this.http.delete<void>(`${this.tourismUrl}/itinerary/${placeId}`);
  }

  optimizeMyItinerary(
    mode: TouristTransportMode,
    returnToHotel: boolean,
  ): Observable<OptimizedTourRoute> {
    return this.http.post<OptimizedTourRoute>(
      `${this.tourismUrl}/itinerary/optimize`,
      { mode, returnToHotel },
    );
  }
}
