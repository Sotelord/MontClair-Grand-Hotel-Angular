import { Component, inject, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReservationService } from '../../service/reservation.service';
import { BoldPaymentService } from '../../service/bold-payment.service';
import { AuthService } from '../../service/auth.service';
import { ReservationDTO } from '../../models/reservation.model';
import { DetailToolbarComponent } from './components/detail-toolbar/detail-toolbar.component';
import { DetailLoadingComponent } from './components/detail-loading/detail-loading.component';
import { DetailNotFoundComponent } from './components/detail-not-found/detail-not-found.component';
import { ReservationHeaderComponent } from './components/reservation-header/reservation-header.component';
import { GuestInfoCardComponent } from './components/guest-info-card/guest-info-card.component';
import { StayDatesCardComponent } from './components/stay-dates-card/stay-dates-card.component';
import { RoomSectionComponent } from './components/room-section/room-section.component';
import { ServicesSectionComponent } from './components/services-section/services-section.component';
import { AccountSummaryComponent } from './components/account-summary/account-summary.component';
import { SuccessAlertComponent } from '../../components/success-alert/success-alert.component';
import { ErrorAlertComponent } from '../../components/error-alert/error-alert.component';

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
    SuccessAlertComponent,
    ErrorAlertComponent,
  ],
  templateUrl: './reservation-detail.component.html',
  styleUrl: './reservation-detail.component.scss',
})
export class ReservationDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reservationService = inject(ReservationService);
  private boldPaymentService = inject(BoldPaymentService);
  private authService = inject(AuthService);
  private location = inject(Location);

  reservation: ReservationDTO | null = null;
  isLoading = true;
  isPayingWithBold = false;
  errorMessage: string | null = null;
  paymentSuccessMessage: string | null = null;
  paymentErrorMessage: string | null = null;

  get isAdminView(): boolean {
    return (
      this.router.url.startsWith('/admin') &&
      this.authService.getSession()?.role?.toUpperCase() === 'ADMIN'
    );
  }

  get isOperatorView(): boolean {
    const role = this.authService.getSession()?.role?.toUpperCase();
    return (
      this.router.url.startsWith('/operator') ||
      role === 'OPERATOR' ||
      role === 'OPERARIO'
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

    this.loadReservation(id);
    this.handleBoldReturnIfPresent(id);
  }

  loadReservation(id: number): void {
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

  payWithBold(): void {
    if (!this.reservation || this.reservation.paid || this.reservation.status === 'CANCELLED') {
      return;
    }
    this.isPayingWithBold = true;
    this.paymentErrorMessage = null;

    const currentPath = this.router.url.split('?')[0] || `/reservations/${this.reservation.id}`;
    this.boldPaymentService.openCheckout(this.reservation.id, currentPath).subscribe({
      next: () => {
        this.isPayingWithBold = false;
      },
      error: (err) => {
        this.isPayingWithBold = false;
        this.paymentErrorMessage =
          err?.error?.message ||
          err?.message ||
          'No se pudo inicializar el botón de pagos Bold.';
      },
    });
  }

  private handleBoldReturnIfPresent(id: number): void {
    const orderId = this.route.snapshot.queryParamMap.get('bold-order-id');
    const txStatus = this.route.snapshot.queryParamMap.get('bold-tx-status');
    if (!orderId || !txStatus) {
      return;
    }

    if (txStatus.toLowerCase() === 'approved') {
      this.boldPaymentService.confirmPayment(id, orderId, txStatus).subscribe({
        next: (updated) => {
          this.reservation = updated;
          this.paymentSuccessMessage = `¡Pago en Bold aprobado! La cuenta de la reserva #${id} ha quedado saldada y se envió el comprobante por correo.`;
          this.clearBoldQueryParams();
        },
        error: (err) => {
          this.paymentErrorMessage =
            err?.error?.message ||
            'El pago fue aprobado en Bold pero no se pudo actualizar la reserva.';
          this.clearBoldQueryParams();
        },
      });
    } else {
      this.paymentErrorMessage = `El pago en Bold finalizó con estado: ${txStatus}.`;
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
