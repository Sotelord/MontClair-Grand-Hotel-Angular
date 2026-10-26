import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { ClientService } from '../../service/client.service';
import { ReservationService } from '../../service/reservation.service';
import { Client } from '../../models/client.model';
import { ReservationDTO } from '../../models/reservation.model';
import { ProfileHeaderComponent } from './components/profile-header/profile-header.component';
import { ErrorAlertComponent } from '../../components/error-alert/error-alert.component';
import { SuccessAlertComponent } from '../../components/success-alert/success-alert.component';
import { ProfileStatsComponent } from './components/profile-stats/profile-stats.component';
import { ReservationsListComponent } from './components/reservations-list/reservations-list.component';
import { DangerZoneComponent } from './components/danger-zone/danger-zone.component';

/**
 * Componente del perfil de usuario / historial de reservas del huésped.
 * Permite visualizar el historial completo de estancias (confirmadas, activas, finalizadas, canceladas)
 * y cancelar reservaciones conservándolas en el registro histórico.
 */
@Component({
  selector: 'app-client-profile',
  standalone: true,
  imports: [
    ProfileHeaderComponent,
    ErrorAlertComponent,
    SuccessAlertComponent,
    ProfileStatsComponent,
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
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  client: Client | null = null;
  reservations: ReservationDTO[] = [];
  isDeletingProfile = false;
  cancellingReservationIds = new Set<number>();
  errorMessage: string | null = null;
  successMessage: string | null = null;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const sessionClient = this.authService.getSession();
    const clientId = idParam ? Number(idParam) : sessionClient?.id || null;

    if (!clientId) {
      this.router.navigate(['/login']);
      return;
    }

    this.clientService.findById(clientId).subscribe({
      next: (client) => {
        this.client = client;
        this.authService.saveSession(client);
      },
      error: () => {
        this.authService.clearSession();
        this.router.navigate(['/login']);
      },
    });

    this.loadReservations(clientId);
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

  logout(): void {
    this.authService.clearSession();
    this.router.navigate(['/login']);
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
      next: (updated) => {
        // Actualizamos en memoria para que se refleje inmediatamente en el historial
        this.reservations = this.reservations.map((item) =>
          item.id === reservation.id
            ? { ...item, status: 'CANCELLED' }
            : item,
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
}
