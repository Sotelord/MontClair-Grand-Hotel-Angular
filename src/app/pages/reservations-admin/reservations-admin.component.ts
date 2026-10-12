import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReservationService } from '../../service/reservation.service';
import { Reservation } from '../../models/reservation.model';
import { AdminPageHeaderComponent } from '../../components/admin-page-header/admin-page-header.component';

@Component({
  selector: 'app-reservations-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminPageHeaderComponent],
  templateUrl: './reservations-admin.component.html',
  styleUrl: './reservations-admin.component.scss',
})
export class ReservationsAdminComponent implements OnInit {
  reservationService = inject(ReservationService);
  private router = inject(Router);

  reservations: Reservation[] = [];
  searchTerm: string = '';
  selectedStatus: string = 'ALL';

  successMessage: string | null = null;
  errorMessage: string | null = null;

  reservationToDelete: Reservation | null = null;

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(): void {
    this.reservations = this.reservationService.getReservations();
  }

  get filteredReservations(): Reservation[] {
    return this.reservations.filter((res) => {
      const query = this.searchTerm.toLowerCase();
      const matchSearch =
        !this.searchTerm ||
        res.client.firstName.toLowerCase().includes(query) ||
        (res.client.lastName && res.client.lastName.toLowerCase().includes(query)) ||
        res.client.email.toLowerCase().includes(query) ||
        res.reservationRooms?.some(
          (rr) =>
            rr.room.number.includes(query) ||
            (rr.room.name && rr.room.name.toLowerCase().includes(query))
        );

      const matchStatus =
        this.selectedStatus === 'ALL' || res.status === this.selectedStatus;

      return matchSearch && matchStatus;
    });
  }

  get totalRevenue(): number {
    return this.reservations.reduce(
      (acc, res) => acc + this.reservationService.calculateGrandTotal(res),
      0
    );
  }

  get totalGuests(): number {
    return this.reservations.reduce((acc, res) => acc + res.numberOfPeople, 0);
  }

  onAddReservation(): void {
    this.router.navigate(['/admin/reservations/new']);
  }

  onEditReservation(id: number): void {
    this.router.navigate(['/admin/reservations/edit', id]);
  }

  confirmDelete(res: Reservation): void {
    this.reservationToDelete = res;
  }

  cancelDelete(): void {
    this.reservationToDelete = null;
  }

  executeDelete(): void {
    if (!this.reservationToDelete) return;

    const resId = this.reservationToDelete.id;
    const result = this.reservationService.deleteReservation(resId);
    if (result.success) {
      this.successMessage = `Reserva #${resId} eliminada correctamente. La habitación asociada ha sido liberada.`;
      this.loadReservations();
      setTimeout(() => (this.successMessage = null), 4000);
    } else {
      this.errorMessage = result.message || 'Error al eliminar la reserva.';
      setTimeout(() => (this.errorMessage = null), 6000);
    }
    this.reservationToDelete = null;
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
