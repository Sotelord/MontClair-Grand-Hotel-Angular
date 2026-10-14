
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReservationService } from '../../service/reservation.service';
import { ReservationDTO } from '../../models/reservation.model';
import { AdminPageHeaderComponent } from '../../components/admin-page-header/admin-page-header.component';

@Component({
  selector: 'app-reservations-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminPageHeaderComponent],
  templateUrl: './reservations-admin.component.html',
  styleUrl: './reservations-admin.component.scss',
})
export class ReservationsAdminComponent implements OnInit {
  private reservationService = inject(ReservationService);
  private router = inject(Router);

  reservations: ReservationDTO[] = [];
  searchTerm: string = '';
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
        this.errorMessage =
          'No se pudieron cargar las reservas.';
      },
    });
  }

  get filteredReservations(): ReservationDTO[] {
    const query = this.searchTerm.trim().toLowerCase();

    return this.reservations.filter((res) => {
      const matchSearch =
        !query ||
        (res.clientFirstName || '').toLowerCase().includes(query) ||
        (res.clientLastName || '').toLowerCase().includes(query) ||
        (res.clientEmail || '').toLowerCase().includes(query) ||
        (res.roomNumber || '').toLowerCase().includes(query) ||
        (res.roomName || '').toLowerCase().includes(query);

      const matchStatus =
        this.selectedStatus === 'ALL' ||
        res.status === this.selectedStatus;

      return matchSearch && matchStatus;
    });
  }

  get totalRevenue(): number {
    return this.reservations.reduce(
      (acc, res) => acc + res.totalPrice,
      0,
    );
  }

  get totalGuests(): number {
    return this.reservations.reduce(
      (acc, res) => acc + res.numberOfPeople,
      0,
    );
  }

  onAddReservation(): void {
    this.router.navigate(['/admin/reservations/new']);
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
        this.errorMessage =
          'Error al eliminar la reserva en el servidor.';

        setTimeout(() => {
          this.errorMessage = null;
        }, 6000);
      },
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  }

  formatId(id: number): string {
    return '#' + String(id).padStart(3, '0');
  }
}
