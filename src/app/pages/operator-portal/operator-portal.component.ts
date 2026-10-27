import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReservationService } from '../../service/reservation.service';
import { ServicesService } from '../../service/services.service';
import { ReservationDTO } from '../../models/reservation.model';
import { Service } from '../../models/service.model';
import { AdminPageHeaderComponent } from '../../components/admin-page-header/admin-page-header.component';
import { ErrorAlertComponent } from '../../components/error-alert/error-alert.component';
import { SuccessAlertComponent } from '../../components/success-alert/success-alert.component';
import { ReservationFiltersComponent } from '../reservations-admin/components/reservation-filters/reservation-filters.component';
import { ReservationsTableComponent } from '../reservations-admin/components/reservations-table/reservations-table.component';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-operator-portal',
  standalone: true,
  imports: [
    FormsModule,
    AdminPageHeaderComponent,
    ErrorAlertComponent,
    SuccessAlertComponent,
    ReservationFiltersComponent,
    ReservationsTableComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './operator-portal.component.html',
  styleUrl: './operator-portal.component.scss',
})
export class OperatorPortalComponent implements OnInit {
  private reservationService = inject(ReservationService);
  private servicesService = inject(ServicesService);
  private router = inject(Router);

  reservations: ReservationDTO[] = [];
  availableServices: Service[] = [];
  selectedStatus: string = 'ALL';
  selectedPayment: string = 'ALL';

  successMessage: string | null = null;
  errorMessage: string | null = null;

  activeAction: {
    type: 'ACTIVATE' | 'PAY' | 'FINISH' | 'CANCEL' | 'DELETE' | 'REMOVE_SERVICE';
    reservation: ReservationDTO;
    serviceId?: number;
    serviceName?: string;
    title: string;
    confirmLabel: string;
    description: string;
  } | null = null;

  selectedReservationForService: ReservationDTO | null = null;
  selectedServiceId: number | null = null;
  serviceQuantity: number = 1;
  processingService: boolean = false;

  ngOnInit(): void {
    this.loadReservations();
    this.loadCatalogServices();
  }

  loadReservations(): void {
    this.reservationService.findSummary().subscribe({
      next: (res) => {
        this.reservations = res || [];
        if (this.selectedReservationForService) {
          const updated = this.reservations.find(
            (r) => r.id === this.selectedReservationForService?.id,
          );
          if (updated) {
            this.selectedReservationForService = updated;
          }
        }
      },
      error: () => {
        this.reservations = [];
        this.errorMessage = 'No se pudieron cargar las reservas.';
      },
    });
  }

  loadCatalogServices(): void {
    this.servicesService.findNotHidden().subscribe({
      next: (services: Service[]) => {
        this.availableServices = (services || []).filter(
          (s: Service) => !s.hidden && (s.price ?? 0) > 0,
        );
        if (this.availableServices.length > 0 && !this.selectedServiceId) {
          this.selectedServiceId = this.availableServices[0].id;
        }
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

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(price || 0);
  }

  onViewReservation(id: number): void {
    this.router.navigate(['/operator/reservations', id]);
  }

  requestActivate(res: ReservationDTO): void {
    this.activeAction = {
      type: 'ACTIVATE',
      reservation: res,
      title: 'Activar Estadía (Check-in)',
      confirmLabel: 'Activar Estadía',
      description: `¿Confirmar la llegada del huésped ${res.clientFirstName} ${res.clientLastName}? La reserva pasará a estado ACTIVA.`,
    };
  }

  requestPay(res: ReservationDTO): void {
    this.activeAction = {
      type: 'PAY',
      reservation: res,
      title: 'Pagar y Liquidar Cuenta de la Estadía',
      confirmLabel: 'Registrar Pago Completo',
      description: `¿Registrar el pago total de ${this.formatPrice(res.pendingBalance || res.totalPrice)} para la reserva #${res.id} de ${res.clientFirstName} ${res.clientLastName}? La cuenta del cliente quedará limpia y saldada.`,
    };
  }

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

  requestCancel(res: ReservationDTO): void {
    this.activeAction = {
      type: 'CANCEL',
      reservation: res,
      title: 'Cancelar Reserva',
      confirmLabel: 'Cancelar Reserva',
      description: `¿Deseas cancelar la reserva #${res.id} de ${res.clientFirstName} ${res.clientLastName}? La habitación será liberada y la reserva se conservará en el historial como CANCELADA.`,
    };
  }

  confirmDelete(res: ReservationDTO): void {
    this.activeAction = {
      type: 'DELETE',
      reservation: res,
      title: 'Confirmar Eliminación de Reserva',
      confirmLabel: 'Eliminar Reserva',
      description: `¿Estás seguro de que deseas eliminar/cancelar la reserva #${res.id} de ${res.clientFirstName} ${res.clientLastName}?`,
    };
  }

  requestRemoveService(event: {
    reservation: ReservationDTO;
    serviceId: number;
    serviceName: string;
  }): void {
    this.activeAction = {
      type: 'REMOVE_SERVICE',
      reservation: event.reservation,
      serviceId: event.serviceId,
      serviceName: event.serviceName,
      title: 'Eliminar Servicio de la Cuenta',
      confirmLabel: 'Eliminar Servicio',
      description: `¿Deseas eliminar el servicio «${event.serviceName}» de la cuenta de la reserva #${event.reservation.id} de ${event.reservation.clientFirstName} ${event.reservation.clientLastName}?`,
    };
  }

  openAddServiceModal(res: ReservationDTO): void {
    this.errorMessage = null;
    this.selectedReservationForService = res;
    this.serviceQuantity = 1;
    if (this.availableServices.length > 0) {
      this.selectedServiceId = this.availableServices[0].id;
    }
  }

  closeAddServiceModal(): void {
    this.selectedReservationForService = null;
  }

  contractService(): void {
    const res = this.selectedReservationForService;
    const roomId = res?.roomId ?? res?.reservationRooms?.[0]?.room?.id;
    if (!res || !roomId || !this.selectedServiceId) {
      return;
    }

    this.errorMessage = null;
    this.processingService = true;

    this.reservationService
      .assignServiceToRoom(
        roomId,
        Number(this.selectedServiceId),
        Number(this.serviceQuantity) || 1,
      )
      .subscribe({
        next: (updated) => {
          this.processingService = false;
          this.selectedReservationForService = updated;
          this.successMessage = `Servicio contratado y cargado a la cuenta de la reserva #${res.id}.`;
          this.loadReservations();
          setTimeout(() => (this.successMessage = null), 4000);
        },
        error: (err) => {
          this.processingService = false;
          this.errorMessage =
            err?.error?.message ||
            'No se pudo contratar el servicio. Verifique que la estadía esté ACTIVA.';
          setTimeout(() => (this.errorMessage = null), 6000);
        },
      });
  }

  removeServiceDirect(
    res: ReservationDTO,
    serviceId?: number,
    serviceName?: string,
  ): void {
    if (!serviceId) return;
    this.errorMessage = null;
    this.reservationService
      .removeServiceFromReservation(res.id, serviceId)
      .subscribe({
        next: (updated) => {
          this.selectedReservationForService = updated;
          this.successMessage = `Servicio «${serviceName || '#' + serviceId}» eliminado de la cuenta de la reserva #${res.id}.`;
          this.loadReservations();
          setTimeout(() => (this.successMessage = null), 4000);
        },
        error: (err) => {
          this.errorMessage =
            err?.error?.message ||
            'Error al eliminar el servicio de la cuenta.';
          setTimeout(() => (this.errorMessage = null), 6000);
        },
      });
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
            this.errorMessage =
              err?.error?.message || 'Error al activar la estadía.';
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
            this.errorMessage =
              err?.error?.message ||
              'Error al registrar el pago de la cuenta.';
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

      case 'REMOVE_SERVICE':
        if (action.serviceId) {
          this.reservationService
            .removeServiceFromReservation(resId, action.serviceId)
            .subscribe({
              next: () => {
                this.successMessage = `Servicio «${action.serviceName}» eliminado de la cuenta de la reserva #${resId}.`;
                this.loadReservations();
                setTimeout(() => (this.successMessage = null), 4000);
              },
              error: (err) => {
                this.errorMessage =
                  err?.error?.message ||
                  'Error al eliminar el servicio de la cuenta.';
                setTimeout(() => (this.errorMessage = null), 6000);
              },
            });
        }
        break;

      case 'CANCEL':
        this.reservationService.cancel(resId).subscribe({
          next: () => {
            this.successMessage = `Reserva #${resId} cancelada exitosamente y conservada en el registro histórico.`;
            this.loadReservations();
            setTimeout(() => (this.successMessage = null), 4000);
          },
          error: (err) => {
            this.errorMessage =
              err?.error?.message || 'Error al cancelar la reserva.';
            setTimeout(() => (this.errorMessage = null), 6000);
          },
        });
        break;

      case 'DELETE':
        this.reservationService.delete(resId).subscribe({
          next: () => {
            this.successMessage = `Reserva #${resId} eliminada/cancelada correctamente.`;
            this.loadReservations();
            setTimeout(() => (this.successMessage = null), 4000);
          },
          error: (err) => {
            this.errorMessage =
              err?.error?.message || 'Error al eliminar la reserva.';
            setTimeout(() => (this.errorMessage = null), 6000);
          },
        });
        break;
    }
  }
}
