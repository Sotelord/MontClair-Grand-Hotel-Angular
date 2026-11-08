import { Component, input, output } from '@angular/core';
import { Service } from '../../../../models/service.model';

@Component({
  selector: 'app-services-selector',
  imports: [],
  templateUrl: './services-selector.component.html',
  styleUrl: './services-selector.component.scss',
  standalone: true,
})
export class ServicesSelectorComponent {
  services = input.required<Service[]>();
  selectedIds = input.required<Set<number>>();
  toggled = output<number>();

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  }
}
