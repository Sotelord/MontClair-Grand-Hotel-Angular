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
  selectedPayment: string = 'ALL';

  successMessage: string | null = null;
  errorMessage: string | null = null;

  // Modales de confirmación para acciones administrativas
  activeAction: {
    type: 'ACTIVATE' | 'PAY' | 'FINISH' | 'CANCEL' | 'DELETE';
    reservation: ReservationDTO;
    title: string;
    confirmLabel: string;
    description: string;
  } | null = null;

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

      const matchPayment =
        this.selectedPayment === 'ALL' ||
        (this.selectedPayment === 'PAID' && res.paid) ||
        (this.selectedPayment === 'UNPAID' && !res.paid);

      return matchStatus && matchPayment;
    });
  }

  get totalRevenue(): number {
    return this.reservations.reduce((acc, res) => acc + res.totalPrice, 0);
  }

  get totalGuests(): number {
    return this.reservations.reduce((acc, res) => acc + res.numberOfPeople, 0);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(price || 0);
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

  /**
   * ACTIVAR ESTADÍA DE UN CLIENTE:
   * Cambia el estado de la reserva a ACTIVO cuando el huésped llega.
   */
  requestActivate(res: ReservationDTO): void {
    this.activeAction = {
      type: 'ACTIVATE',
      reservation: res,
      title: 'Activar Estadía (Check-in)',
      confirmLabel: 'Activar Estadía',
      description: `¿Confirmar la llegada del huésped ${res.clientFirstName} ${res.clientLastName}? La reserva pasará a estado ACTIVA.`,
    };
  }

  /**
   * PAGAR CUENTA DE UNA ESTADÍA:
   * Se liquida y limpia la cuenta del cliente (paid = true, saldo pendiente = 0).
   */
  requestPay(res: ReservationDTO): void {
    this.activeAction = {
      type: 'PAY',
      reservation: res,
      title: 'Pagar y Liquidar Cuenta de la Estadía',
      confirmLabel: 'Registrar Pago Completo',
      description: `¿Registrar el pago total de ${this.formatPrice(res.pendingBalance || res.totalPrice)} para la reserva #${res.id} de ${res.clientFirstName} ${res.clientLastName}? La cuenta del cliente quedará limpia y saldada.`,
    };
  }

  /**
   * ACABAR ESTADÍA DE UN CLIENTE:
   * Cambia el estado a INACTIVO.
   * REGLA DE NEGOCIO ESTRICTA: SOLO SE PERMITE REALIZAR ESTE PROCEDIMIENTO SI LA CUENTA ESTÁ VACÍA (YA PAGÓ).
   */
  requestFinish(res: ReservationDTO): void {
    if (!res.paid) {
      this.errorMessage = `No se puede finalizar la estadía de ${res.clientFirstName} ${res.clientLastName}. La cuenta tiene un saldo pendiente de ${this.formatPrice(res.pendingBalance || res.totalPrice)}. Debe registrar el pago de la cuenta antes de dar salida al huésped.`;
      setTimeout(() => {
        this.errorMessage = null;
      }, 7000);
      return;
    }

    this.activeAction = {
      type: 'FINISH',
      reservation: res,
      title: 'Finalizar Estadía (Check-out)',
      confirmLabel: 'Finalizar Estadía',
      description: `La cuenta de la estadía ya se encuentra completamente pagada (0,00 € pendientes). ¿Deseas dar salida al huésped ${res.clientFirstName} ${res.clientLastName}? El estado pasará a INACTIVO y la habitación quedará liberada para el inventario.`,
    };
  }

  /**
   * CANCELAR RESERVA:
   * REGLA 4: Solo se pueden cancelar reservas que todavía no están activas,
   * es decir que su fecha de inicio es posterior a la fecha actual.
   * Cambia el estado a CANCELADA sin eliminarla físicamente, conservando el historial.
   */
  requestCancel(res: ReservationDTO): void {
    if (res.status === 'ACTIVE') {
      this.errorMessage = `No se puede cancelar la reserva #${res.id}: solo se pueden cancelar reservas que todavía no están activas.`;
      return;
    }

    if (res.checkInDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const parts = res.checkInDate.split('-').map(Number);
      const checkIn = new Date(parts[0], parts[1] - 1, parts[2]);
      if (checkIn.getTime() <= today.getTime()) {
        this.errorMessage = `No se puede cancelar la reserva #${res.id}: la fecha de inicio debe ser posterior a la fecha actual.`;
        return;
      }
    }

    this.activeAction = {
      type: 'CANCEL',
      reservation: res,
      title: 'Cancelar Reserva',
      confirmLabel: 'Cancelar Reserva',
      description: `¿Deseas cancelar la reserva #${res.id} de ${res.clientFirstName} ${res.clientLastName}? La habitación será liberada y la reserva se conservará en el historial como CANCELADA.`,
    };
  }

  /**
   * ELIMINAR RESERVA DE LA VISTA / PURGAR
   */
  confirmDelete(res: ReservationDTO): void {
    this.activeAction = {
      type: 'DELETE',
      reservation: res,
      title: 'Confirmar Cancelación / Eliminación',
      confirmLabel: 'Eliminar Reserva',
      description: `¿Estás seguro de que deseas eliminar/cancelar la reserva #${res.id} de ${res.clientFirstName} ${res.clientLastName}?`,
    };
  }

  cancelModal(): void {
    this.activeAction = null;
  }

  executeModalAction(): void {
    if (!this.activeAction) return;

    const action = this.activeAction;
    const resId = action.reservation.id;
    this.activeAction = null;
    this.errorMessage = null;

    switch (action.type) {
      case 'ACTIVATE':
        this.reservationService.activate(resId).subscribe({
          next: () => {
            this.successMessage = `Estadía de la reserva #${resId} activada exitosamente (Huésped en hotel).`;
            this.loadReservations();
            setTimeout(() => (this.successMessage = null), 4000);
          },
          error: (err) => {
            this.errorMessage = err?.error?.message || 'Error al activar la estadía.';
            setTimeout(() => (this.errorMessage = null), 6000);
          },
        });
        break;

      case 'PAY':
        this.reservationService.pay(resId).subscribe({
          next: () => {
            this.successMessage = `¡Cuenta de la estadía #${resId} pagada con éxito! Se ha limpiado la cuenta del cliente (saldo pendiente: 0,00 €).`;
            this.loadReservations();
            setTimeout(() => (this.successMessage = null), 4000);
          },
          error: (err) => {
            this.errorMessage = err?.error?.message || 'Error al registrar el pago de la cuenta.';
            setTimeout(() => (this.errorMessage = null), 6000);
          },
        });
        break;

      case 'FINISH':
        this.reservationService.finish(resId).subscribe({
          next: () => {
            this.successMessage = `Estadía de la reserva #${resId} finalizada correctamente (Check-out realizado). El estado ha cambiado a INACTIVO y la habitación ha sido liberada.`;
            this.loadReservations();
            setTimeout(() => (this.successMessage = null), 4000);
          },
          error: (err) => {
            this.errorMessage =
              err?.error?.message ||
              'No se pudo finalizar la estadía. Verifique que la cuenta esté pagada.';
            setTimeout(() => (this.errorMessage = null), 6000);
          },
        });
        break;

      case 'CANCEL':
        this.reservationService.cancel(resId).subscribe({
          next: () => {
            this.successMessage = `Reserva #${resId} cancelada exitosamente y conservada en el registro histórico.`;
            this.loadReservations();
            setTimeout(() => (this.successMessage = null), 4000);
          },
          error: (err) => {
            this.errorMessage = err?.error?.message || 'Error al cancelar la reserva.';
            setTimeout(() => (this.errorMessage = null), 6000);
          },
        });
        break;

      case 'DELETE':
        this.reservationService.delete(resId).subscribe({
          next: () => {
            this.successMessage = `Reserva #${resId} procesada correctamente.`;
            this.loadReservations();
            setTimeout(() => (this.successMessage = null), 4000);
          },
          error: (err) => {
            this.errorMessage = err?.error?.message || 'Error al eliminar la reserva.';
            setTimeout(() => (this.errorMessage = null), 6000);
          },
        });
        break;
    }
  }
}
