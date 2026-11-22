import { Component, input, output } from '@angular/core';
import { Service } from '../../../../models/service.model';

@Component({
  selector: 'app-services-table',
  standalone: true,
  imports: [],
  templateUrl: './services-table.component.html',
  styleUrl: './services-table.component.scss',
})
export class ServicesTableComponent {
  services = input.required<Service[]>();

  edit = output<Service>();
  delete = output<Service>();
  toggleVisibility = output<Service>();

  formatId(id: number): string {
    return '#' + String(id).padStart(3, '0');
  }

  formatPrice(price: number): string {
    if (!price) return 'Sin cargo';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  }

  onEdit(service: Service): void {
    this.edit.emit(service);
  }

  onDelete(service: Service): void {
    this.delete.emit(service);
  }

  onToggleVisibility(service: Service): void {
    this.toggleVisibility.emit(service);
  }
}
