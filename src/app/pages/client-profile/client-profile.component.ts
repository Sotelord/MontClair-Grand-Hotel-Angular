import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { ClientService } from '../../service/client.service';
import { ReservationService } from '../../service/reservation.service';
import { Client } from '../../models/client.model';
import { Reservation } from '../../models/reservation.model';

@Component({
  selector: 'app-client-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
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
  reservations: Reservation[] = [];
  isDeletingProfile = false;
  deletingReservationIds = new Set<number>();
  errorMessage: string | null = null;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const sessionClient = this.authService.getSession();
    const clientId = idParam ? Number(idParam) : (sessionClient?.id || null);

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

  deleteReservation(reservation: Reservation): void {
    if (
      !this.client ||
      (reservation.client &&
        reservation.client.id !== this.client.id)
    ) {
      this.errorMessage = 'No se puede eliminar esta reservación.';
      return;
    }

    if (
      !confirm(
        `¿Estás seguro de que deseas eliminar la reservación #${reservation.id}? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }

    this.deletingReservationIds.add(reservation.id);
    this.errorMessage = null;

    this.reservationService.delete(reservation.id).subscribe({
      next: () => {
        this.reservations = this.reservations.filter(
          (item) => item.id !== reservation.id,
        );
        this.deletingReservationIds.delete(reservation.id);
      },
      error: () => {
        this.deletingReservationIds.delete(reservation.id);
        this.errorMessage =
          'No se pudo eliminar la reservación. Intenta nuevamente.';
      },
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  }
}
