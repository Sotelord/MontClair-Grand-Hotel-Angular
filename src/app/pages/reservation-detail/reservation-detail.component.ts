import { Component, inject, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReservationService } from '../../service/reservation.service';
import { AuthService } from '../../service/auth.service';
import { Reservation } from '../../models/reservation.model';
import { DetailToolbarComponent } from './components/detail-toolbar/detail-toolbar.component';
import { DetailLoadingComponent } from './components/detail-loading/detail-loading.component';
import { DetailNotFoundComponent } from './components/detail-not-found/detail-not-found.component';
import { ReservationHeaderComponent } from './components/reservation-header/reservation-header.component';
import { GuestInfoCardComponent } from './components/guest-info-card/guest-info-card.component';
import { StayDatesCardComponent } from './components/stay-dates-card/stay-dates-card.component';
import { RoomSectionComponent } from './components/room-section/room-section.component';
import { ServicesSectionComponent } from './components/services-section/services-section.component';
import { AccountSummaryComponent } from './components/account-summary/account-summary.component';

@Component({
  selector: 'app-reservation-detail',
  standalone: true,
  imports: [
    DetailToolbarComponent,
    DetailLoadingComponent,
    DetailNotFoundComponent,
    ReservationHeaderComponent,
    GuestInfoCardComponent,
    StayDatesCardComponent,
    RoomSectionComponent,
    ServicesSectionComponent,
    AccountSummaryComponent,
  ],
  templateUrl: './reservation-detail.component.html',
  styleUrl: './reservation-detail.component.scss',
})
export class ReservationDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reservationService = inject(ReservationService);
  private authService = inject(AuthService);
  private location = inject(Location);

  reservation: Reservation | null = null;
  isLoading = true;
  errorMessage: string | null = null;

  get isAdminView(): boolean {
    return (
      this.router.url.startsWith('/admin') &&
      this.authService.getSession()?.role?.toUpperCase() === 'ADMIN'
    );
  }

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
        this.errorMessage =
          'No se encontró la reserva solicitada o hubo un error al cargarla.';
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
      this.reservation.checkOutDate,
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
}
