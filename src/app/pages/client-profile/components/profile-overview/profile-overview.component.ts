import { Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Client } from '../../../../models/client.model';
import { ReservationDTO } from '../../../../models/reservation.model';
import { LoyaltySummaryDTO } from '../../../../models/loyalty.model';
import { ProfileStatsComponent } from '../profile-stats/profile-stats.component';
import { ProfileTab } from '../../profile-tab.type';

@Component({
  selector: 'app-profile-overview',
  standalone: true,
  imports: [CommonModule, RouterLink, ProfileStatsComponent],
  templateUrl: './profile-overview.component.html',
  styleUrl: './profile-overview.component.scss',
})
export class ProfileOverviewComponent {
  client = input.required<Client>();
  reservations = input.required<ReservationDTO[]>();
  loyaltySummary = input<LoyaltySummaryDTO | null>(null);

  navigateToTab = output<ProfileTab>();

  validNights = computed(() =>
    this.reservations()
      .filter((r) => r.status !== 'CANCELLED')
      .reduce((acc, r) => acc + (r.nights || 0), 0),
  );

  availablePoints = computed(
    () => this.loyaltySummary()?.points ?? this.client().points ?? 0,
  );

  nextReservation = computed<ReservationDTO | null>(() => {
    const upcoming = this.reservations().filter(
      (r) => r.status === 'ACTIVE' || r.status === 'CONFIRMED',
    );
    return upcoming.length > 0 ? upcoming[0] : null;
  });

  tierProgress = computed(() => {
    const summary = this.loyaltySummary();
    if (!summary) {
      return {
        currentTierLabel: this.client().loyaltyTierLabel || 'Classic',
        progressPct: 0,
        multiplier: 1.0,
        message: 'Acumule puntos con sus estadías para subir de categoría.',
      };
    }

    if (!summary.nextTierLabel) {
      return {
        currentTierLabel: summary.tierLabel,
        progressPct: 100,
        multiplier: summary.pointsMultiplier,
        message: 'Ha alcanzado nuestro máximo nivel de distinción Imperial.',
      };
    }

    return {
      currentTierLabel: summary.tierLabel,
      progressPct: summary.progressPercentage,
      multiplier: summary.pointsMultiplier,
      message: `Le faltan ${summary.pointsToNextTier.toLocaleString()} pts históricos para alcanzar el nivel ${summary.nextTierLabel}.`,
    };
  });

  readonly arcLength = 251.3;

  arcDashOffset = computed(() => {
    const pct = this.tierProgress().progressPct;
    return this.arcLength - (this.arcLength * pct) / 100;
  });
}
