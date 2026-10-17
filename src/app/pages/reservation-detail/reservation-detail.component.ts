import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReservationService } from '../../service/reservation.service';
import { Reservation } from '../../models/reservation.model';

@Component({
  selector: 'app-reservation-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './reservation-detail.component.html',
  styleUrl: './reservation-detail.component.scss',
})
export class ReservationDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reservationService = inject(ReservationService);
  private location = inject(Location);

  reservation: Reservation | null = null;
  isLoading = true;
  errorMessage: string | null = null;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);

    if (!id || isNaN(id)) {
      this.errorMessage = 'Identificador de reserva no válido.';
      this.isLoading = false;
      return;
    }

    this.reservationService.findById(id).subscribe({
      next: (res) => {
        this.reservation = res;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'No se encontró la reserva solicitada o hubo un error al cargarla.';
        this.isLoading = false;
      },
    });
  }

  get assignedRoom() {
    return this.reservation?.reservationRooms?.[0]?.room || null;
  }

  get roomPricePerNight(): number {
    return (
      this.reservation?.reservationRooms?.[0]?.pricePerNight ||
      this.assignedRoom?.pricePerNight ||
      0
    );
  }

  get acquiredServices() {
    return this.reservation?.reservationRooms?.[0]?.acquiredServices || [];
  }

  get nightsCount(): number {
    if (!this.reservation) return 1;
    return this.reservationService.calculateNights(
      this.reservation.checkInDate,
      this.reservation.checkOutDate
    );
  }

  get roomSubtotal(): number {
    if (!this.reservation) return 0;
    return this.reservationService.calculateRoomSubtotal(this.reservation);
  }

  get servicesSubtotal(): number {
    if (!this.reservation) return 0;
    return this.reservationService.calculateServicesSubtotal(this.reservation);
  }

  get grandTotal(): number {
    if (!this.reservation) return 0;
    return this.reservationService.calculateGrandTotal(this.reservation);
  }

  goBack(): void {
    this.location.back();
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(price || 0);
  }
}
