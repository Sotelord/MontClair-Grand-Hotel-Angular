import { NgClass } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { Service } from '../../../../models/service.model';

@Component({
  selector: 'app-services-step',
  imports: [NgClass],
  templateUrl: './services-step.component.html',
  styleUrl: './services-step.component.scss',
  standalone: true,
})
export class ServicesStepComponent {
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
