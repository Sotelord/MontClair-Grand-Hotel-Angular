import { Component, computed, input, output } from '@angular/core';
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
  client = input.required<Client>();
  activeTab = input.required<ProfileTab>();
  reservationsCount = input.required<number>();
  redeemedCount = input<number>(0);
  loyaltySummary = input<LoyaltySummaryDTO | null>(null);

  tabSelected = output<ProfileTab>();
  logoutClicked = output<void>();

  readonly defaultAvatar =
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';

  readonly navItems: ProfileNavItem[] = [
    { id: 'overview', label: 'Resumen de Cuenta' },
    { id: 'details', label: 'Detalles del Perfil' },
    { id: 'edit', label: 'Editar Perfil' },
    { id: 'reservations', label: 'Mis Reservas' },
    { id: 'rewards', label: 'Catálogo de Recompensas' },
    { id: 'redeemed', label: 'Canjeados' },
    { id: 'transactions', label: 'Transacciones de Puntos' },
    { id: 'security', label: 'Seguridad y Cuenta' },
  ];

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

  selectTab(tab: ProfileTab): void {
    this.tabSelected.emit(tab);
  }
}
