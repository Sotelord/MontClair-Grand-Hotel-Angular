import { Component, computed, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReservationDTO } from '../../../../models/reservation.model';
import { ReservationCardComponent } from '../reservation-card/reservation-card.component';
import { NgClass } from '@angular/common';

/**
 * Componente que renderiza el listado e historial de reservas del huésped.
 * Permite filtrar por pestañas: Todas, Activas/Confirmadas, Finalizadas y Canceladas.
 */
@Component({
  selector: 'app-reservations-list',
  imports: [RouterLink, ReservationCardComponent, NgClass],
  templateUrl: './reservations-list.component.html',
  styleUrl: './reservations-list.component.scss',
  standalone: true,
})
export class ReservationsListComponent {
  reservations = input.required<ReservationDTO[]>();
  clientId = input.required<number>();
  cancellingIds = input.required<Set<number>>();
  cancelRequested = output<ReservationDTO>();

  activeTab = signal<'ALL' | 'ACTIVE_OR_CONFIRMED' | 'INACTIVE' | 'CANCELLED'>('ALL');

  filteredReservations = computed(() => {
    const list = this.reservations();
    const tab = this.activeTab();

    if (tab === 'ACTIVE_OR_CONFIRMED') {
      return list.filter((r) => r.status === 'CONFIRMED' || r.status === 'ACTIVE');
    }
    if (tab === 'INACTIVE') {
      return list.filter((r) => r.status === 'INACTIVE');
    }
    if (tab === 'CANCELLED') {
      return list.filter((r) => r.status === 'CANCELLED');
    }
    return list;
  });

  countConfirmedOrActive = computed(() =>
    this.reservations().filter((r) => r.status === 'CONFIRMED' || r.status === 'ACTIVE').length,
  );

  countInactive = computed(() =>
    this.reservations().filter((r) => r.status === 'INACTIVE').length,
  );

  countCancelled = computed(() =>
    this.reservations().filter((r) => r.status === 'CANCELLED').length,
  );
}
