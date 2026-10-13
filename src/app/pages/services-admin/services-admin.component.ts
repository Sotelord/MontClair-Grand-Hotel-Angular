import { Component, inject, OnInit } from '@angular/core';
import { AdminPageHeaderComponent } from '../../components/admin-page-header/admin-page-header.component';
import { ServicesTableComponent } from './components/services-table/services-table.component';
import { ServicesService } from '../../service/services.service';
import { Router } from '@angular/router';
import { Service } from '../../models/service.model';
import { ReservationService } from '../../service/reservation.service';
import { Reservation } from '../../models/reservation.model';

@Component({
  selector: 'app-services-admin',
  standalone: true,
  imports: [AdminPageHeaderComponent, ServicesTableComponent],
  templateUrl: './services-admin.component.html',
  styleUrl: './services-admin.component.scss'
})
export class ServicesAdminComponent implements OnInit {
  private servicesService = inject(ServicesService);
  private reservationService = inject(ReservationService);
  private router = inject(Router);

  services: Service[] = [];
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.servicesService.findAll().subscribe({
      next: (services) => {
        this.services = services || [];
      },
      error: () => {
        this.services = [];
      },
    });
  }

  onAdd(): void {
    this.router.navigate(['admin/services/add']);
  }

  onEdit(service: Service): void {
    this.router.navigate(['admin/services/edit', service.id]);
  }

  onDelete(service: Service): void {
    this.errorMessage = null;

    this.reservationService.findAll().subscribe({
      next: (reservations) => {
        if (this.hasReservationWithService(reservations || [], service.id)) {
          this.errorMessage = `No se puede eliminar el servicio "${service.name}" porque está asociado a una reservación.`;
          return;
        }

        this.deleteService(service);
      },
      error: () => {
        this.errorMessage =
          'No se puede comprobar si el servicio está asociado a una reservación. Intenta nuevamente.';
      },
    });
  }

  onToggleVisibility(service: Service): void {
    this.errorMessage = null;
    this.servicesService.toggleVisibility(service).subscribe({
      next: (updatedService) => {
        const index = this.services.findIndex((item) => item.id === service.id);
        if (index !== -1) {
          this.services[index] = updatedService;
        }
      },
      error: () => {
        this.errorMessage = `No se pudo ${service.hidden ? 'mostrar' : 'ocultar'} el servicio "${service.name}".`;
      },
    });
  }

  private hasReservationWithService(
    reservations: Reservation[],
    serviceId: number,
  ): boolean {
    return reservations.some((reservation) =>
      reservation.reservationRooms?.some((reservationRoom) =>
        reservationRoom.acquiredServices?.some(
          (acquiredService) => acquiredService.service?.id === serviceId,
        ),
      ),
    );
  }

  private deleteService(service: Service): void {
    this.servicesService.delete(service.id).subscribe({
      next: () => this.loadServices(),
      error: () => {
        this.errorMessage = `No se pudo eliminar el servicio "${service.name}". Puede estar asociado a una reservación.`;
      },
    });
  }
}
