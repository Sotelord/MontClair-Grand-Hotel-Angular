import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ReservationService } from '../../service/reservation.service';
import { ReservationDTO } from '../../models/reservation.model';
import { AdminPageHeaderComponent } from '../../components/admin-page-header/admin-page-header.component';
import { ErrorAlertComponent } from '../../components/error-alert/error-alert.component';
import { SuccessAlertComponent } from '../../components/success-alert/success-alert.component';
import { ReservationFiltersComponent } from './components/reservation-filters/reservation-filters.component';
import { ReservationsTableComponent } from './components/reservations-table/reservations-table.component';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-reservations-admin',
  standalone: true,
  imports: [
    AdminPageHeaderComponent,
    ErrorAlertComponent,
    SuccessAlertComponent,
    ReservationFiltersComponent,
    ReservationsTableComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './reservations-admin.component.html',
  styleUrl: './reservations-admin.component.scss',
})
export class ReservationsAdminComponent implements OnInit {
  private reservationService = inject(ReservationService);
  private router = inject(Router);

  reservations: ReservationDTO[] = [];
  selectedStatus: string = 'ALL';

  successMessage: string | null = null;
  errorMessage: string | null = null;

  reservationToDelete: ReservationDTO | null = null;

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.reservationService.findSummary().subscribe({
      next: (res) => {
        this.reservations = res || [];
      },
      error: () => {
        this.reservations = [];
        this.errorMessage = 'No se pudieron cargar las reservas.';
      },
    });
  }

  get filteredReservations(): ReservationDTO[] {
    return this.reservations.filter((res) => {
      const matchStatus =
        this.selectedStatus === 'ALL' || res.status === this.selectedStatus;

      return matchStatus;
    });
  }

  get totalRevenue(): number {
    return this.reservations.reduce((acc, res) => acc + res.totalPrice, 0);
  }

  get totalGuests(): number {
    return this.reservations.reduce((acc, res) => acc + res.numberOfPeople, 0);
  }

  onAddReservation(): void {
    this.router.navigate(['/admin/reservations/new']);
  }

  onViewReservation(id: number): void {
    this.router.navigate(['/admin/reservations', id]);
  }

  onEditReservation(id: number): void {
    this.router.navigate(['/admin/reservations/edit', id]);
  }

  confirmDelete(res: ReservationDTO): void {
    this.reservationToDelete = res;
  }

  cancelDelete(): void {
    this.reservationToDelete = null;
  }

  executeDelete(): void {
    if (!this.reservationToDelete) return;

    const resId = this.reservationToDelete.id;
    this.reservationToDelete = null;

    this.reservationService.delete(resId).subscribe({
      next: () => {
        this.successMessage =
          `Reserva #${resId} eliminada correctamente. ` +
          'La habitación asociada ha sido liberada.';

        this.loadReservations();

        setTimeout(() => {
          this.successMessage = null;
        }, 4000);
      },
      error: () => {
        this.errorMessage = 'Error al eliminar la reserva en el servidor.';

        setTimeout(() => {
          this.errorMessage = null;
        }, 6000);
      },
    });
  }
}
