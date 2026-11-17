import { Component, input } from '@angular/core';
import { AcquiredService } from '../../../../models/adquiredService.model';
import { ReservationServiceDTO } from '../../../../models/reservation.model';

@Component({
  selector: 'app-services-section',
  imports: [],
  templateUrl: './services-section.component.html',
  styleUrl: './services-section.component.scss',
  standalone: true,
})
export class ServicesSectionComponent {
  services = input.required<(ReservationServiceDTO | AcquiredService)[]>();

  getServiceName(item: ReservationServiceDTO | AcquiredService): string {
    return (
      (item as ReservationServiceDTO).name ||
      (item as AcquiredService).service?.name ||
      'Servicio del Hotel'
    );
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  }
}
