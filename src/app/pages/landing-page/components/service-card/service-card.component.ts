import { Component, input } from '@angular/core';
import { Service } from '../../../../models/service.model';

@Component({
  selector: 'app-service-card',
  imports: [],
  templateUrl: './service-card.component.html',
  styleUrl: './service-card.component.scss',
})
export class ServiceCardComponent {
  service = input.required<Service>();

  getIconUrl(): string | null {
    const icon = this.service().icon;
    if (icon && icon.trim() !== '') return icon;
    const name = (this.service().name || '').toLowerCase();
    if (name.includes('restauran')) return '/images/ic_Restaurante.png';
    if (name.includes('spa') || name.includes('bienestar')) return '/images/ic_Spa.png';
    if (name.includes('habitacion') || name.includes('room')) return '/images/Servicio Habitaciones.png';
    return null;
  }

  isGym(): boolean {
    const name = (this.service().name || '').toLowerCase();
    return name.includes('gimnas') || name.includes('fitness') || name.includes('gym');
  }

  isPool(): boolean {
    const name = (this.service().name || '').toLowerCase();
    return name.includes('piscina') || name.includes('alberca') || name.includes('pool');
  }
}
