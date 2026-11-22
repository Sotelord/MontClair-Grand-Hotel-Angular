import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { ClientService } from '../../service/client.service';
import { ReservationService } from '../../service/reservation.service';
import { BoldPaymentService } from '../../service/bold-payment.service';
import { LoyaltyService } from '../../service/loyalty.service';
import { RewardService } from '../../service/reward.service';
import { Client } from '../../models/client.model';
import { ReservationDTO } from '../../models/reservation.model';
import {
  LoyaltySummaryDTO,
  PointTransactionDTO,
  RedeemedRewardDTO,
  RewardDTO,
} from '../../models/loyalty.model';
import { ErrorAlertComponent } from '../../components/error-alert/error-alert.component';
import { SuccessAlertComponent } from '../../components/success-alert/success-alert.component';
import { ReservationsListComponent } from './components/reservations-list/reservations-list.component';
import { DangerZoneComponent } from './components/danger-zone/danger-zone.component';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { ProfileSidebarComponent } from './components/profile-sidebar/profile-sidebar.component';
import { ProfileOverviewComponent } from './components/profile-overview/profile-overview.component';
import { ProfileDetailsComponent } from './components/profile-details/profile-details.component';
import { ProfileEditPanelComponent } from './components/profile-edit-panel/profile-edit-panel.component';
import { RewardsCatalogComponent } from './components/rewards-catalog/rewards-catalog.component';
import { RedeemedRewardsListComponent } from './components/redeemed-rewards-list/redeemed-rewards-list.component';
import { PointTransactionsListComponent } from './components/point-transactions-list/point-transactions-list.component';
import { ProfileTab } from './profile-tab.type';
import { TourismItineraryComponent } from './components/tourism-itinerary/tourism-itinerary.component';
import { PendingTouristPlaceService } from '../../service/pending-tourist-place.service';

/**
 * Componente del perfil de usuario / historial de reservas y programa de fidelidad del huésped.
 * Coordina resumen de cuenta, datos personales, reservas, catálogo de recompensas,
 * recompensas canjeadas y libro mayor de transacciones de puntos.
 */
@Component({
  selector: 'app-client-profile',
  standalone: true,
  imports: [
    PageHeaderComponent,
    ProfileSidebarComponent,
    ProfileOverviewComponent,
    ProfileDetailsComponent,
    ProfileEditPanelComponent,
    RewardsCatalogComponent,
    RedeemedRewardsListComponent,
    PointTransactionsListComponent,
    TourismItineraryComponent,
    ErrorAlertComponent,
    SuccessAlertComponent,
    ReservationsListComponent,
    DangerZoneComponent,
  ],
  templateUrl: './client-profile.component.html',
  styleUrl: './client-profile.component.scss',
})
export class ClientProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private clientService = inject(ClientService);
  private reservationService = inject(ReservationService);
  private boldPaymentService = inject(BoldPaymentService);
  private loyaltyService = inject(LoyaltyService);
  private rewardService = inject(RewardService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private pendingTouristPlaceService = inject(PendingTouristPlaceService);

  client: Client | null = null;
  reservations: ReservationDTO[] = [];
  loyaltySummary: LoyaltySummaryDTO | null = null;
  rewardsCatalog: RewardDTO[] = [];
  redeemedRewards: RedeemedRewardDTO[] = [];
  pointTransactions: PointTransactionDTO[] = [];

  activeTab: ProfileTab = 'overview';
  isViewingOwnProfile = true;
  isDeletingProfile = false;
  redeemingRewardId: number | null = null;
  cancellingReservationIds = new Set<number>();
  payingReservationIds = new Set<number>();
  errorMessage: string | null = null;
  successMessage: string | null = null;

  selectTab(tab: ProfileTab): void {
    this.activeTab = tab;
    this.errorMessage = null;
  }

  onProfileUpdated(updated: Client): void {
    this.client = updated;
    this.activeTab = 'details';
    this.successMessage =
      '¡Tu información de perfil ha sido actualizada con éxito!';
    setTimeout(() => {
      this.successMessage = null;
    }, 5000);
  }

  ngOnInit(): void {
    const sessionClient = this.authService.getSession();
    const idParam = Number(this.route.snapshot.paramMap.get('id'));
    const role = sessionClient?.role?.toUpperCase();
    const isStaff =
      role === 'ADMIN' || role === 'OPERATOR' || role === 'OPERARIO';

    const viewingOtherClient =
      isStaff && idParam > 0 && idParam !== sessionClient?.id;
    this.isViewingOwnProfile = !viewingOtherClient;

    const tabParam = this.route.snapshot.queryParamMap.get('tab') as ProfileTab | null;
    if (tabParam && ['overview', 'details', 'edit', 'reservations', 'itinerary', 'rewards', 'redeemed', 'transactions', 'security'].includes(tabParam)) {
      this.activeTab = tabParam;
    }

    // El personal puede ver el perfil de otra persona por id; el cliente siempre ve el suyo (lo identifica el JWT)
    const client$ = viewingOtherClient
      ? this.clientService.findById(idParam)
      : this.clientService.getMyDetails();

    client$.subscribe({
      next: (client) => {
        this.client = client;
        if (
          this.isViewingOwnProfile &&
          client.role?.toUpperCase() === 'CLIENT' &&
          this.pendingTouristPlaceService.hasPending()
        ) {
          this.activeTab = 'itinerary';
        } else if (tabParam) {
          this.activeTab = tabParam;
        }
        if (!sessionClient || sessionClient.id === client.id) {
          this.authService.saveSession(client);
        }
        this.loadReservations(client.id);
        this.loadLoyaltyData(client.id);
        this.loadRewardsCatalog();
        this.handleBoldReturnIfPresent(client.id);
      },
      error: () => {
        this.authService.clearSession();
        this.router.navigate(['/login']);
      },
    });

    this.route.queryParamMap.subscribe((params) => {
      const tab = params.get('tab') as ProfileTab | null;
      if (tab && ['overview', 'details', 'edit', 'reservations', 'itinerary', 'rewards', 'redeemed', 'transactions', 'security'].includes(tab)) {
        this.activeTab = tab;
      }
    });
  }

  loadReservations(clientId: number): void {
    this.reservationService.findByClientId(clientId).subscribe({
      next: (reservations) => {
        this.reservations = reservations || [];
      },
      error: () => {
        this.reservations = [];
      },
    });
  }

  loadRewardsCatalog(): void {
    this.rewardService.getActiveCatalog().subscribe({
      next: (rewards) => {
        this.rewardsCatalog = rewards || [];
      },
      error: () => {
        this.rewardsCatalog = [];
      },
    });
  }

  loadLoyaltyData(clientId: number): void {
    const summary$ = this.isViewingOwnProfile
      ? this.loyaltyService.getMySummary()
      : this.loyaltyService.getClientSummary(clientId);

    const redeemed$ = this.isViewingOwnProfile
      ? this.loyaltyService.getMyRedeemedRewards()
      : this.loyaltyService.getClientRedeemedRewards(clientId);

    const transactions$ = this.isViewingOwnProfile
      ? this.loyaltyService.getMyTransactions()
      : this.loyaltyService.getClientTransactions(clientId);

    summary$.subscribe({
      next: (summary) => {
        this.loyaltySummary = summary;
        if (this.client && summary) {
          this.client = {
            ...this.client,
            points: summary.points,
            lifetimePoints: summary.lifetimePoints,
            loyaltyTier: summary.tier,
            loyaltyTierLabel: summary.tierLabel,
          };
        }
      },
      error: () => {
        this.loyaltySummary = null;
      },
    });

    redeemed$.subscribe({
      next: (items) => {
        this.redeemedRewards = items || [];
      },
      error: () => {
        this.redeemedRewards = [];
      },
    });

    transactions$.subscribe({
      next: (txs) => {
        this.pointTransactions = txs || [];
      },
      error: () => {
        this.pointTransactions = [];
      },
    });
  }

  redeemReward(reward: RewardDTO): void {
    if (!this.client || !this.isViewingOwnProfile || this.redeemingRewardId) {
      return;
    }

    this.redeemingRewardId = reward.id;
    this.errorMessage = null;
    this.successMessage = null;

    this.loyaltyService.redeemReward(reward.id).subscribe({
      next: (redeemed) => {
        this.redeemingRewardId = null;
        this.successMessage = `¡Canje exitoso! Has canjeado "${redeemed.rewardName}" por ${redeemed.pointsSpent.toLocaleString()} puntos. Código de canje: ${redeemed.redemptionCode}.`;
        this.loadLoyaltyData(this.client!.id);
        this.loadRewardsCatalog();
        this.activeTab = 'redeemed';
      },
      error: (err) => {
        this.redeemingRewardId = null;
        this.errorMessage =
          err?.error?.message ||
          'No se pudo completar el canje de la recompensa. Verifica tus puntos y categoría.';
      },
    });
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login']),
    });
  }

  deleteProfile(): void {
    if (!this.client) {
      this.errorMessage = 'No se puede eliminar este perfil.';
      return;
    }

    if (
      !confirm(
        '¿Estás seguro de que deseas eliminar permanentemente tu perfil? Esta acción no se puede deshacer.',
      )
    ) {
      return;
    }

    this.isDeletingProfile = true;
    this.errorMessage = null;

    this.clientService.delete(this.client.id).subscribe({
      next: () => {
        this.authService.clearSession();
        this.router.navigate(['/']);
      },
      error: () => {
        this.isDeletingProfile = false;
        this.errorMessage =
          'No se pudo eliminar el perfil. Verifica que no tenga reservaciones asociadas.';
      },
    });
  }

  /**
   * Cancela una reserva del cliente.
   * Por regla de negocio, no se elimina de la base de datos: se marca como CANCELADA
   * y se mantiene accesible en el historial de reservas del huésped.
   */
  cancelReservation(reservation: ReservationDTO): void {
    if (
      !this.client ||
      (reservation.clientId && reservation.clientId !== this.client.id)
    ) {
      this.errorMessage = 'No se puede cancelar esta reservación.';
      return;
    }

    if (reservation.status === 'CANCELLED') {
      return;
    }

    if (
      !confirm(
        `¿Deseas cancelar la reservación #${reservation.id}? La habitación quedará liberada y la reserva se mantendrá registrada como CANCELADA en tu historial.`,
      )
    ) {
      return;
    }

    this.cancellingReservationIds.add(reservation.id);
    this.errorMessage = null;

    this.reservationService.cancel(reservation.id).subscribe({
      next: () => {
        this.reservations = this.reservations.map((item) =>
          item.id === reservation.id ? { ...item, status: 'CANCELLED' } : item,
        );
        this.cancellingReservationIds.delete(reservation.id);
        this.successMessage = `La reservación #${reservation.id} ha sido cancelada exitosamente y permanece en tu historial.`;

        setTimeout(() => {
          this.successMessage = null;
        }, 5000);
      },
      error: (err) => {
        this.cancellingReservationIds.delete(reservation.id);
        this.errorMessage =
          err?.error?.message ||
          'No se pudo cancelar la reservación. Intenta nuevamente.';
      },
    });
  }

  /**
   * Inicia el flujo de pago con Bold Checkout (valor simbólico fijo = 1).
   */
  payReservationWithBold(reservation: ReservationDTO): void {
    if (!this.client || !reservation?.id || reservation.paid) {
      return;
    }

    this.payingReservationIds.add(reservation.id);
    this.errorMessage = null;

    const returnPath = `/profile/${this.client.id}`;
    this.boldPaymentService.openCheckout(reservation.id, returnPath).subscribe({
      next: () => {
        this.payingReservationIds.delete(reservation.id);
      },
      error: (err) => {
        this.payingReservationIds.delete(reservation.id);
        this.errorMessage =
          err?.error?.message ||
          err?.message ||
          'No se pudo inicializar el botón de pagos Bold.';
      },
    });
  }

  private handleBoldReturnIfPresent(clientId: number): void {
    const orderId = this.route.snapshot.queryParamMap.get('bold-order-id');
    const txStatus = this.route.snapshot.queryParamMap.get('bold-tx-status');
    if (!orderId || !txStatus) {
      return;
    }

    const reservationId = this.boldPaymentService.extractReservationId(orderId);
    if (!reservationId) {
      return;
    }

    this.activeTab = 'reservations';

    if (txStatus.toLowerCase() === 'approved') {
      this.boldPaymentService
        .confirmPayment(reservationId, orderId, txStatus)
        .subscribe({
          next: () => {
            this.successMessage = `¡Pago en Bold aprobado! La cuenta de tu reservación #${reservationId} ha quedado saldada y tus puntos MontClair Privilège han sido acreditados.`;
            this.loadReservations(clientId);
            this.loadLoyaltyData(clientId);
            this.clearBoldQueryParams();
          },
          error: (err) => {
            this.errorMessage =
              err?.error?.message ||
              'El pago fue procesado en Bold pero ocurrió un error al actualizar la reserva.';
            this.clearBoldQueryParams();
          },
        });
    } else {
      this.errorMessage = `La transacción en Bold para la reserva #${reservationId} finalizó con estado: ${txStatus}.`;
      this.clearBoldQueryParams();
    }
  }

  private clearBoldQueryParams(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { 'bold-order-id': null, 'bold-tx-status': null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }
}

