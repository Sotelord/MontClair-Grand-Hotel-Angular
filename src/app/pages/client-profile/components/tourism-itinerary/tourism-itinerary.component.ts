import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  ItineraryStop,
  OptimizedTourRoute,
  TouristRouteVisit,
  TouristTransportMode,
} from '../../../../models/tourism.model';
import { PendingTouristPlaceService } from '../../../../service/pending-tourist-place.service';
import { TourismService } from '../../../../service/tourism.service';
import { TourismRouteMapComponent } from '../tourism-route-map/tourism-route-map.component';

interface GoogleMapsLeg {
  url: string;
  label: string;
}

@Component({
  selector: 'app-tourism-itinerary',
  standalone: true,
  imports: [CommonModule, RouterLink, TourismRouteMapComponent],
  templateUrl: './tourism-itinerary.component.html',
  styleUrl: './tourism-itinerary.component.scss',
})
export class TourismItineraryComponent implements OnInit {
  private readonly tourismService = inject(TourismService);
  private readonly pendingPlaceService = inject(PendingTouristPlaceService);

  itinerary: ItineraryStop[] = [];
  route: OptimizedTourRoute | null = null;
  mode: TouristTransportMode = 'WALKING';
  returnToHotel = true;
  isLoading = true;
  isOptimizing = false;
  addingPendingPlace = false;
  removingPlaceIds = new Set<number>();
  errorMessage: string | null = null;
  successMessage: string | null = null;
  showMapLegs = false;
  pendingPlaceId: number | null = null;

  ngOnInit(): void {
    this.pendingPlaceId = this.pendingPlaceService.getPending();
    if (this.pendingPlaceId !== null) {
      this.addPendingPlace(this.pendingPlaceId);
      return;
    }
    this.loadItinerary();
  }

  get orderedItinerary(): ItineraryStop[] {
    if (!this.route) {
      return this.itinerary;
    }

    const itineraryByPlaceId = new Map(
      this.itinerary.map((stop) => [stop.place.id, stop]),
    );
    const routePlaceIds = this.route.visits
      .filter(
        (visit): visit is TouristRouteVisit & { placeId: number } =>
          visit.type === 'DESTINATION' && visit.placeId !== null,
      )
      .sort(
        (first, second) =>
          (first.visitOrder ?? Number.MAX_SAFE_INTEGER) -
          (second.visitOrder ?? Number.MAX_SAFE_INTEGER),
      )
      .map((visit) => visit.placeId);

    const orderedStops = routePlaceIds
      .map((placeId) => itineraryByPlaceId.get(placeId))
      .filter((stop): stop is ItineraryStop => stop !== undefined);
    return orderedStops.length ? orderedStops : this.itinerary;
  }

  get googleMapsLegs(): GoogleMapsLeg[] {
    if (!this.route || this.route.visits.length < 2) {
      return [];
    }

    const maxWaypoints = window.matchMedia('(max-width: 640px)').matches ? 3 : 9;
    const maxPointsPerLeg = maxWaypoints + 2;
    const routePoints = this.route.visits;
    const legs: GoogleMapsLeg[] = [];

    for (
      let start = 0;
      start < routePoints.length - 1;
      start += maxPointsPerLeg - 1
    ) {
      const points = routePoints.slice(
        start,
        Math.min(start + maxPointsPerLeg, routePoints.length),
      );
      if (points.length < 2) {
        continue;
      }

      const origin = points[0];
      const destination = points[points.length - 1];
      const params = new URLSearchParams({
        api: '1',
        origin: this.coordinatesFor(origin),
        destination: this.coordinatesFor(destination),
        travelmode: this.route.mode === 'DRIVING' ? 'driving' : 'walking',
      });
      if (points.length > 2) {
        params.set(
          'waypoints',
          points
            .slice(1, -1)
            .map((point) => this.coordinatesFor(point))
            .join('|'),
        );
      }
      legs.push({
        url: `https://www.google.com/maps/dir/?${params.toString()}`,
        label: `Abrir tramo ${legs.length + 1}`,
      });
    }
    return legs;
  }

  formatDistance(distanceMeters: number): string {
    if (distanceMeters >= 1000) {
      return `${(distanceMeters / 1000).toLocaleString('es-ES', {
        maximumFractionDigits: 1,
      })} km`;
    }
    return `${Math.round(distanceMeters).toLocaleString('es-ES')} m`;
  }

  formatDuration(durationSeconds: number): string {
    const totalMinutes = Math.ceil(durationSeconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours ? `${hours} h ${minutes} min` : `${minutes} min`;
  }

  setTransportMode(event: Event): void {
    const selected = (event.target as HTMLSelectElement).value;
    this.mode = selected === 'DRIVING' ? 'DRIVING' : 'WALKING';
    this.route = null;
    this.errorMessage = null;
  }

  setReturnToHotel(event: Event): void {
    this.returnToHotel = (event.target as HTMLInputElement).checked;
    this.route = null;
  }

  optimizeRoute(): void {
    if (!this.itinerary.length || this.isOptimizing) {
      return;
    }

    this.isOptimizing = true;
    this.route = null;
    this.errorMessage = null;
    this.successMessage = null;
    this.showMapLegs = false;

    this.tourismService
      .optimizeMyItinerary(this.mode, this.returnToHotel)
      .subscribe({
        next: (route) => {
          this.route = route;
          this.isOptimizing = false;
        },
        error: (error: HttpErrorResponse) => {
          const clientRoute = this.computeClientRoute(this.mode, this.returnToHotel);
          if (clientRoute) {
            this.route = clientRoute;
            this.isOptimizing = false;
            this.successMessage =
              'Recorrido optimizado partiendo desde MontClair Grand Hotel.';
          } else {
            this.isOptimizing = false;
            this.errorMessage =
              error.error?.message ||
              'No fue posible optimizar el recorrido. Intenta nuevamente.';
          }
        },
      });
  }

  getDirectionsUrl(place: { latitude: number; longitude: number; googleMapsUrl?: string }): string {
    if (place.googleMapsUrl) {
      return place.googleMapsUrl;
    }
    const origin = encodeURIComponent(
      "Hôtel Hermitage Monte-Carlo, Square Beaumarchais, 98000 Monaco",
    );
    const destination = `${place.latitude},${place.longitude}`;
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
  }

  private computeClientRoute(
    mode: TouristTransportMode,
    returnToHotel: boolean,
  ): OptimizedTourRoute | null {
    if (!this.itinerary.length) {
      return null;
    }
    const hotelLat = 43.7384432;
    const hotelLng = 7.4259517;
    const hotelOriginName = "Montclair Grand Hotel (Hôtel Hermitage)";
    const hotelMapsUrl = 'https://maps.app.goo.gl/hGMqVYHjjAP1ZwFLA';

    const remainingStops = [...this.itinerary];
    const orderedStops: ItineraryStop[] = [];
    let currentLat = hotelLat;
    let currentLng = hotelLng;

    while (remainingStops.length > 0) {
      let nearestIdx = 0;
      let minDistance = Number.MAX_VALUE;
      for (let i = 0; i < remainingStops.length; i++) {
        const p = remainingStops[i].place;
        const d = this.haversineMeters(currentLat, currentLng, p.latitude, p.longitude);
        if (d < minDistance) {
          minDistance = d;
          nearestIdx = i;
        }
      }
      const [nextStop] = remainingStops.splice(nearestIdx, 1);
      orderedStops.push(nextStop);
      currentLat = nextStop.place.latitude;
      currentLng = nextStop.place.longitude;
    }

    const visits: TouristRouteVisit[] = [];
    visits.push({
      type: 'HOTEL',
      visitOrder: 0,
      placeId: null,
      name: hotelOriginName,
      latitude: hotelLat,
      longitude: hotelLng,
      suggestedDurationMinutes: null,
      googleMapsUrl: hotelMapsUrl,
    });

    let totalDist = 0;
    let prevLat = hotelLat;
    let prevLng = hotelLng;
    const geometry: number[][] = [[hotelLng, hotelLat]];

    orderedStops.forEach((stop, index) => {
      const p = stop.place;
      totalDist += this.haversineMeters(prevLat, prevLng, p.latitude, p.longitude);
      prevLat = p.latitude;
      prevLng = p.longitude;
      geometry.push([p.longitude, p.latitude]);

      visits.push({
        type: 'DESTINATION',
        visitOrder: index + 1,
        placeId: p.id,
        name: p.name,
        latitude: p.latitude,
        longitude: p.longitude,
        suggestedDurationMinutes: p.suggestedDurationMinutes,
        googleMapsUrl: this.getDirectionsUrl(p),
      });
    });

    if (returnToHotel) {
      totalDist += this.haversineMeters(prevLat, prevLng, hotelLat, hotelLng);
      geometry.push([hotelLng, hotelLat]);
      visits.push({
        type: 'HOTEL',
        visitOrder: orderedStops.length + 1,
        placeId: null,
        name: `${hotelOriginName} (Regreso)`,
        latitude: hotelLat,
        longitude: hotelLng,
        suggestedDurationMinutes: null,
        googleMapsUrl: hotelMapsUrl,
      });
    }

    const roadDist = Math.round(totalDist * 1.3);
    const speedMps = mode === 'WALKING' ? 1.3 : 7.0;
    const durationSeconds = Math.round(roadDist / speedMps);

    const waypoints = visits
      .slice(1, -1)
      .map((v) => `${v.latitude},${v.longitude}`)
      .join('|');
    const hotelOriginEncoded = encodeURIComponent(
      "Hôtel Hermitage Monte-Carlo, Square Beaumarchais, 98000 Monaco",
    );
    const params = new URLSearchParams({
      api: '1',
      origin: "Hôtel Hermitage Monte-Carlo, Square Beaumarchais, 98000 Monaco",
      destination: returnToHotel
        ? "Hôtel Hermitage Monte-Carlo, Square Beaumarchais, 98000 Monaco"
        : `${prevLat},${prevLng}`,
      travelmode: mode === 'DRIVING' ? 'driving' : 'walking',
    });
    if (waypoints) {
      params.set('waypoints', waypoints);
    }

    return {
      mode,
      returnToHotel,
      distanceMeters: roadDist,
      durationSeconds,
      visits,
      geometry,
      geometryType: 'LineString',
      googleMapsUrl: `https://www.google.com/maps/dir/?${params.toString()}`,
      optimizationNote:
        'Recorrido optimizado partiendo desde MontClair Grand Hotel.',
    };
  }

  private haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  removePlace(placeId: number): void {
    if (this.removingPlaceIds.has(placeId)) {
      return;
    }

    this.removingPlaceIds.add(placeId);
    this.errorMessage = null;
    this.successMessage = null;
    this.tourismService.removeFromMyItinerary(placeId).subscribe({
      next: () => {
        this.itinerary = this.itinerary.filter(
          (stop) => stop.place.id !== placeId,
        );
        this.route = null;
        this.removingPlaceIds.delete(placeId);
        this.successMessage = 'El destino se eliminó de tu itinerario.';
      },
      error: (error: HttpErrorResponse) => {
        this.removingPlaceIds.delete(placeId);
        this.errorMessage =
          error.error?.message ||
          'No se pudo eliminar el destino. Intenta nuevamente.';
      },
    });
  }

  retryLoad(): void {
    this.errorMessage = null;
    this.loadItinerary();
  }

  retryPendingPlace(): void {
    if (this.pendingPlaceId !== null && !this.addingPendingPlace) {
      this.addPendingPlace(this.pendingPlaceId);
    }
  }

  private addPendingPlace(placeId: number): void {
    this.addingPendingPlace = true;
    this.errorMessage = null;
    this.tourismService.addToMyItinerary(placeId).subscribe({
      next: (stop) => {
        this.addingPendingPlace = false;
        this.pendingPlaceService.clearPending();
        this.pendingPlaceId = null;
        this.successMessage = `${stop.place.name} se agregó a Mi itinerario.`;
        this.loadItinerary();
      },
      error: (error: HttpErrorResponse) => {
        this.addingPendingPlace = false;
        this.errorMessage =
          error.error?.message ||
          'No se pudo agregar el destino guardado. Puedes intentarlo desde Descubre Mónaco.';
        this.loadItinerary();
      },
    });
  }

  private loadItinerary(): void {
    this.isLoading = true;
    this.tourismService.getMyItinerary().subscribe({
      next: (stops) => {
        this.itinerary = stops;
        this.isLoading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.isLoading = false;
        this.errorMessage =
          error.error?.message ||
          'No fue posible cargar tu itinerario. Intenta nuevamente.';
      },
    });
  }

  private coordinatesFor(visit: TouristRouteVisit): string {
    return `${visit.latitude},${visit.longitude}`;
  }
}
