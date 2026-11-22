import {
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Client } from '../../../../models/client.model';
import { LoyaltySummaryDTO } from '../../../../models/loyalty.model';
import { ProfileTab } from '../../profile-tab.type';

interface ProfileNavItem {
  id: ProfileTab;
  label: string;
}

@Component({
  selector: 'app-profile-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-sidebar.component.html',
  styleUrl: './profile-sidebar.component.scss',
})
export class ProfileSidebarComponent {
  private host: ElementRef<HTMLElement> = inject(ElementRef);

  client = input.required<Client>();
  activeTab = input.required<ProfileTab>();
  reservationsCount = input.required<number>();
  redeemedCount = input<number>(0);
  loyaltySummary = input<LoyaltySummaryDTO | null>(null);

  tabSelected = output<ProfileTab>();
  logoutClicked = output<void>();

  /** Menú desplegable abierto/cerrado (solo aplica en celular y tablet) */
  menuOpen = signal(false);

  readonly defaultAvatar =
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';

  readonly navItems: ProfileNavItem[] = [
    { id: 'overview', label: 'Resumen de Cuenta' },
    { id: 'details', label: 'Detalles del Perfil' },
    { id: 'edit', label: 'Editar Perfil' },
    { id: 'reservations', label: 'Mis Reservas' },
    { id: 'itinerary', label: 'Mi Itinerario' },
    { id: 'rewards', label: 'Catálogo de Recompensas' },
    { id: 'redeemed', label: 'Canjeados' },
    { id: 'transactions', label: 'Transacciones de Puntos' },
    { id: 'security', label: 'Seguridad y Cuenta' },
  ];

  readonly iconPaths: Record<ProfileTab, string> = {
    overview:
      'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    details:
      'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    edit: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    reservations:
      'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    itinerary:
      'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7',
    rewards:
      'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7',
    redeemed:
      'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z',
    transactions: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    security:
      'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  };

  activeLabel = computed(
    () =>
      this.navItems.find((item) => item.id === this.activeTab())?.label ??
      'Mi Cuenta',
  );

  memberCode = computed(() => {
    const id = this.client().id ?? 0;
    return `MC-${String(id).padStart(6, '0')}`;
  });

  availablePoints = computed(
    () => this.loyaltySummary()?.points ?? this.client().points ?? 0,
  );

  membershipLabel = computed(() => {
    const role = this.client().role?.toUpperCase();
    if (role === 'ADMIN') return 'ADMINISTRADOR';
    if (role === 'OPERATOR' || role === 'OPERARIO') return 'OPERADOR';
    const label =
      this.loyaltySummary()?.tierLabel ||
      this.client().loyaltyTierLabel ||
      'Classic';
    return `${label.toUpperCase()} MEMBER`;
  });

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  selectTab(tab: ProfileTab): void {
    this.tabSelected.emit(tab);
    this.menuOpen.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (
      this.menuOpen() &&
      !this.host.nativeElement.contains(event.target as Node)
    ) {
      this.menuOpen.set(false);
    }
  }
}
