import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { OptimizedTourRoute } from '../../../../models/tourism.model';
import * as L from 'leaflet';

@Component({
  selector: 'app-tourism-route-map',
  standalone: true,
  template: `
    @if (mapIssue) {
      <p class="map-issue" role="status">{{ mapIssue }}</p>
    }
    <div
      #mapContainer
      class="route-map"
      aria-label="Mapa del recorrido optimizado"
    ></div>
  `,
  styleUrl: './tourism-route-map.component.scss',
})
export class TourismRouteMapComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  @Input({ required: true }) route!: OptimizedTourRoute;
  @ViewChild('mapContainer') private mapContainer?: ElementRef<HTMLDivElement>;

  mapIssue: string | null = null;

  private map?: L.Map;
  private routeLayers?: L.LayerGroup;
  private resizeObserver?: ResizeObserver;
  private viewReady = false;

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.initResizeObserver();
    this.renderRoute();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['route'] && this.viewReady) {
      this.renderRoute();
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.map?.remove();
    this.map = undefined;
  }

  private initResizeObserver(): void {
    const container = this.mapContainer?.nativeElement;
    if (container && typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        if (this.map) {
          this.map.invalidateSize();
        }
      });
      this.resizeObserver.observe(container);
    }
  }

  private renderRoute(): void {
    const coordinates = this.route.geometry
      .filter(
        (point) =>
          Array.isArray(point) &&
          point.length >= 2 &&
          Number.isFinite(point[0]) &&
          Number.isFinite(point[1]) &&
          Math.abs(point[0]) <= 180 &&
          Math.abs(point[1]) <= 90,
      )
      .map((point) => [point[1], point[0]] as L.LatLngTuple);

    if (coordinates.length < 2) {
      this.routeLayers?.clearLayers();
      this.mapIssue = 'El mapa se mostrará al generar el recorrido.';
      return;
    }
    this.mapIssue = null;

    const container = this.mapContainer?.nativeElement;
    if (!container) {
      return;
    }
    if (!this.map) {
      this.map = L.map(container, {
        scrollWheelZoom: false,
        zoomControl: true,
      });
      // OpenStreetMap standard tiles: gratuitas, oficiales y sin requerimiento de API Key
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        subdomains: 'abc',
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
      }).addTo(this.map);
      this.routeLayers = L.layerGroup().addTo(this.map);
    }

    this.routeLayers?.clearLayers();
    const routeLine = L.polyline(coordinates, {
      color: '#BF925A',
      opacity: 0.95,
      weight: 5,
    }).addTo(this.routeLayers!);

    this.route.visits.forEach((visit, index) => {
      if (
        !Number.isFinite(visit.latitude) ||
        !Number.isFinite(visit.longitude) ||
        Math.abs(visit.latitude) > 90 ||
        Math.abs(visit.longitude) > 180
      ) {
        return;
      }

      const isHotel = visit.type === 'HOTEL';
      const markerText = isHotel
        ? 'H'
        : String(visit.visitOrder ?? index).padStart(2, '0');
      const marker = L.marker([visit.latitude, visit.longitude], {
        icon: L.divIcon({
          className: '',
          html: `<span style="display:grid;width:30px;height:30px;place-items:center;border:2px solid #fff;border-radius:50%;background:${isHotel ? '#141E26' : '#BF925A'};box-shadow:0 2px 6px rgba(0,0,0,0.35);color:#fff;font-size:10px;font-weight:700;">${markerText}</span>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        }),
        title: visit.name,
      });
      const popupContent = document.createElement('span');
      popupContent.textContent = visit.name;
      marker.bindPopup(popupContent).addTo(this.routeLayers!);
    });

    const refreshBounds = () => {
      if (this.map && routeLine) {
        this.map.invalidateSize();
        try {
          this.map.fitBounds(routeLine.getBounds(), { padding: [28, 28] });
        } catch {
          // ignore
        }
      }
    };

    refreshBounds();
    window.setTimeout(refreshBounds, 120);
    window.setTimeout(refreshBounds, 350);
  }
}
