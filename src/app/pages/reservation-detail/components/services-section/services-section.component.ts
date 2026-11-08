import { Component, input } from '@angular/core';
import { AcquiredService } from '../../../../models/adquiredService.model';

@Component({
  selector: 'app-services-section',
  imports: [],
  templateUrl: './services-section.component.html',
  styleUrl: './services-section.component.scss',
  standalone: true,
})
export class ServicesSectionComponent {
  services = input.required<AcquiredService[]>();

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  }
}
