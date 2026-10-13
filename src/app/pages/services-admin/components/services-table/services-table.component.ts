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
    if (price === 0) return 'Sin cargo';
    return '€ ' + price.toFixed(2).replace('.', ',');
  }

  onEdit(service: Service): void {
    this.edit.emit(service);
  }

  onDelete(service: Service): void {
    if (confirm(`¿Estás seguro de que quieres eliminar el servicio "${service.name}"?`)) {
      this.delete.emit(service);
    }
  }

  onToggleVisibility(service: Service): void {
    const action = service.hidden ? 'mostrar' : 'ocultar';
    if (
      confirm(
        `¿Estás seguro de que quieres ${action} el servicio "${service.name}"?`,
      )
    ) {
      this.toggleVisibility.emit(service);
    }
  }
}
