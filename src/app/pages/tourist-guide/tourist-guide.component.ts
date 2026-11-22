import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { AuthService } from '../../service/auth.service';
import { PendingTouristPlaceService } from '../../service/pending-tourist-place.service';
import { TourismService } from '../../service/tourism.service';
import { TouristPlace } from '../../models/tourism.model';
import { DEFAULT_TOURIST_PLACES } from './tourist-guide-data';

interface GuideCategory {
  id: string;
  label: string;
  slugs?: string[];
}

@Component({
  selector: 'app-tourist-guide',
  standalone: true,
  imports: [CommonModule, RouterLink, PageHeaderComponent],
  templateUrl: './tourist-guide.component.html',
  styleUrl: './tourist-guide.component.scss',
})
export class TouristGuideComponent implements OnInit {
  private readonly tourismService = inject(TourismService);
  private readonly authService = inject(AuthService);
  private readonly pendingPlaceService = inject(PendingTouristPlaceService);
  private readonly router = inject(Router);

  @ViewChild('bookContainer') private bookContainer?: ElementRef<HTMLElement>;

  /** Punto donde empezó el toque, para detectar el gesto de deslizar */
  private touchStartX = 0;
  private touchStartY = 0;

  /**
   * Catálogo de 5 categorías con EXACTAMENTE 5 lugares reales cada una (25 lugares en total).
   * No se repite ningún lugar entre categorías.
   */
  readonly categories: GuideCategory[] = [
    { id: 'all', label: 'Toda la guía' },
    {
      id: 'iconic',
      label: 'Lugares icónicos',
      slugs: [
        'casino-de-monte-carlo',
        'puerto-hercules',
        'palacio-del-principe',
        'museo-oceanografico',
        'curva-fairmont-f1',
      ],
    },
    {
      id: 'culture',
      label: 'Cultura e historia',
      slugs: [
        'opera-de-monte-carlo',
        'catedral-de-monaco',
        'coleccion-automoviles-principe',
        'fort-antoine',
        'villa-sauber',
      ],
    },
    {
      id: 'nature',
      label: 'Naturaleza y playas',
      slugs: [
        'jardin-exotique',
        'jardin-japones',
        'playa-larvotto',
        'jardines-saint-martin',
        'roseraye-princesse-grace',
      ],
    },
    {
      id: 'gastronomy',
      label: 'Gastronomía',
      slugs: [
        'le-louis-xv-alain-ducasse',
        'cafe-de-paris-monte-carlo',
        'le-grill-hotel-de-paris',
        'maya-bay-monaco',
        'marche-de-la-condamine',
      ],
    },
    {
      id: 'experiences',
      label: 'Experiencias y paseos',
      slugs: [
        'champions-promenade',
        'callejuelas-le-rocher',
        'puerto-de-fontvieille',
        'mirador-place-du-palais',
        'jardins-petite-afrique',
      ],
    },
  ];

  places: TouristPlace[] = [...DEFAULT_TOURIST_PLACES];
  selectedCategory = 'all';
  pageIndex = 0;
  pageSize = 2;
  isLoading = true;
  isTurningPage = false;
  turnDirection: 'next' | 'prev' = 'next';
  errorMessage: string | null = null;
  actionMessage: string | null = null;
  addingPlaceIds = new Set<number>();
  addedPlaceIds = new Set<number>();

  ngOnInit(): void {
    this.updatePageSize();
    this.loadPlaces();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updatePageSize();
  }

  get filteredPlaces(): TouristPlace[] {
    const category = this.categories.find(
      (item) => item.id === this.selectedCategory,
    );
    if (!category || category.id === 'all') {
      return this.places;
    }
    if (category.slugs) {
      return this.places.filter((place) =>
        category.slugs!.includes(place.slug),
      );
    }
    return this.places;
  }

  get visiblePlaces(): TouristPlace[] {
    const offset = this.pageIndex * this.pageSize;
    return this.filteredPlaces.slice(offset, offset + this.pageSize);
  }

  get pageCount(): number {
    return Math.ceil(this.filteredPlaces.length / this.pageSize);
  }

  selectCategory(categoryId: string, event?: Event): void {
    this.selectedCategory = categoryId;
    this.pageIndex = 0;
    this.actionMessage = null;

    // En celular, desliza la fila de categorías para centrar el botón elegido
    const button = event?.currentTarget as HTMLElement | null;
    button?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }

  turnPage(direction: -1 | 1): void {
    const nextPage = this.pageIndex + direction;
    if (nextPage < 0 || nextPage >= this.pageCount || this.isTurningPage) {
      return;
    }
    this.turnDirection = direction === 1 ? 'next' : 'prev';
    this.isTurningPage = true;
    window.setTimeout(() => {
      this.pageIndex = nextPage;
      this.isTurningPage = false;
      this.scrollBookIntoView();
    }, 380);
  }

  /**
   * En celular la página es larga y los botones quedan abajo: al pasar de
   * página, si el inicio del libro quedó fuera de la pantalla, subimos hasta él
   * para que la persona empiece a leer la nueva página desde arriba.
   */
  private scrollBookIntoView(): void {
    const el = this.bookContainer?.nativeElement;
    if (!el) return;
    if (el.getBoundingClientRect().top < 0) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /* ---------- Pasar página deslizando el dedo (celular/tablet) ---------- */
  onTouchStart(event: TouchEvent): void {
    const touch = event.changedTouches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
  }

  onTouchEnd(event: TouchEvent): void {
    const touch = event.changedTouches[0];
    const dx = touch.clientX - this.touchStartX;
    const dy = touch.clientY - this.touchStartY;
    // Solo cuenta como "pasar página" si el gesto es claramente horizontal
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.5) {
      return;
    }
    this.turnPage(dx < 0 ? 1 : -1);
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (
      img &&
      !img.src.includes('Hotel%20Atardecer') &&
      !img.src.includes('Hotel Atardecer')
    ) {
      img.src = 'images/Hotel Atardecer.jpg';
    }
  }

  getDirectionsUrl(place: TouristPlace): string {
    if (place.googleMapsUrl) {
      return place.googleMapsUrl;
    }
    const origin = encodeURIComponent(
      'Hôtel Hermitage Monte-Carlo, Square Beaumarchais, 98000 Monaco',
    );
    const destination = `${place.latitude},${place.longitude}`;
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
  }

  formatOrder(order: number): string {
    return String(order).padStart(2, '0');
  }

  toRoman(num: number): string {
    const lookup: [number, string][] = [
      [10, 'X'],
      [9, 'IX'],
      [5, 'V'],
      [4, 'IV'],
      [1, 'I'],
    ];
    let result = '';
    let remainder = num;
    for (const [val, roman] of lookup) {
      while (remainder >= val) {
        result += roman;
        remainder -= val;
      }
    }
    return result || String(num);
  }

  addToItinerary(place: TouristPlace): void {
    this.errorMessage = null;
    this.actionMessage = null;

    if (!this.authService.getSession()) {
      this.pendingPlaceService.save(place.id);
      void this.router.navigate(['/login']);
      return;
    }

    if (this.addingPlaceIds.has(place.id) || this.addedPlaceIds.has(place.id)) {
      return;
    }

    this.addingPlaceIds.add(place.id);
    this.tourismService.addToMyItinerary(place.id).subscribe({
      next: () => {
        this.addingPlaceIds.delete(place.id);
        this.addedPlaceIds.add(place.id);
        this.actionMessage = `${place.name} se agregó a su itinerario.`;
      },
      error: (error: HttpErrorResponse) => {
        this.addingPlaceIds.delete(place.id);
        if (error.status === 401) {
          this.pendingPlaceService.save(place.id);
          this.authService.clearSession();
          void this.router.navigate(['/login']);
          return;
        }
        this.errorMessage =
          error.error?.message ||
          `No se pudo agregar ${place.name} a su itinerario.`;
      },
    });
  }

  loadPlaces(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.tourismService.getPlaces().subscribe({
      next: (places) => {
        const allowedSlugs = new Set(DEFAULT_TOURIST_PLACES.map((p) => p.slug));
        if (places && places.length > 0) {
          const validPlaces = places.filter((p) => allowedSlugs.has(p.slug));
          const presentSlugs = new Set(validPlaces.map((p) => p.slug));
          const missing = DEFAULT_TOURIST_PLACES.filter(
            (def) => !presentSlugs.has(def.slug),
          );
          this.places = [...validPlaces, ...missing].sort(
            (first, second) => first.displayOrder - second.displayOrder,
          );
        } else {
          this.places = [...DEFAULT_TOURIST_PLACES];
        }
        this.isLoading = false;
      },
      error: () => {
        this.places = [...DEFAULT_TOURIST_PLACES];
        this.isLoading = false;
      },
    });
  }

  private updatePageSize(): void {
    // Debe coincidir con el breakpoint del SCSS (1024px): antes el TS usaba 768px
    // y el CSS min-width: 768px, así que justo en 768px (iPad mini) se mostraba
    // una sola página dentro del libro de dos páginas, con la derecha vacía.
    const nextPageSize = window.matchMedia('(max-width: 1023px)').matches
      ? 1
      : 2;
    if (nextPageSize === this.pageSize) {
      return;
    }

    const firstVisiblePlace = this.pageIndex * this.pageSize;
    this.pageSize = nextPageSize;
    this.pageIndex = Math.floor(firstVisiblePlace / this.pageSize);
  }
}
