import { Component, inject, OnInit } from '@angular/core';
import { AdminPageHeaderComponent } from '../../components/admin-page-header/admin-page-header.component';
import { ServicesTableComponent } from './components/services-table/services-table.component';
import { ServicesService } from '../../service/services.service';
import { Router } from '@angular/router';
import { Service } from '../../models/service.model';
import { ErrorAlertComponent } from '../../components/error-alert/error-alert.component';
import { SuccessAlertComponent } from '../../components/success-alert/success-alert.component';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-services-admin',
  standalone: true,
  imports: [
    AdminPageHeaderComponent,
    ServicesTableComponent,
    ErrorAlertComponent,
    SuccessAlertComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './services-admin.component.html',
  styleUrl: './services-admin.component.scss',
})
export class ServicesAdminComponent implements OnInit {
  private servicesService = inject(ServicesService);
  private router = inject(Router);

  services: Service[] = [];
  errorMessage: string | null = null;
  successMessage: string | null = null;

  pendingAction: { type: 'delete' | 'toggle'; service: Service } | null = null;

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

  requestDelete(service: Service): void {
    this.pendingAction = { type: 'delete', service };
  }

  requestToggle(service: Service): void {
    this.pendingAction = { type: 'toggle', service };
  }

  executePendingAction(): void {
    const action = this.pendingAction;
    this.pendingAction = null;
    if (!action) return;
    if (action.type === 'delete') {
      this.onDelete(action.service);
    } else {
      this.onToggleVisibility(action.service);
    }
  }

  onDelete(service: Service): void {
    this.errorMessage = null;
    this.successMessage = null;
    this.servicesService.delete(service.id).subscribe({
      next: () => {
        this.services = this.services.filter((item) => item.id !== service.id);
        this.showSuccess(`Servicio "${service.name}" eliminado correctamente.`);
      },
      error: (err) => {
        this.errorMessage =
          err?.error?.message ||
          `No se pudo eliminar el servicio "${service.name}". Puede estar asociado a una reservación.`;
      },
    });
  }

  onToggleVisibility(service: Service): void {
    this.errorMessage = null;
    this.successMessage = null;
    this.servicesService.toggleVisibility(service).subscribe({
      next: (updatedService) => {
        this.services = this.services.map((item) =>
          item.id === service.id ? updatedService : item,
        );
        this.showSuccess(
          `Servicio "${service.name}" ${updatedService.hidden ? 'ocultado' : 'visible de nuevo'}.`,
        );
      },
      error: () => {
        this.errorMessage = `No se pudo ${service.hidden ? 'mostrar' : 'ocultar'} el servicio "${service.name}".`;
      },
    });
  }

  private showSuccess(message: string): void {
    this.successMessage = message;
    setTimeout(() => (this.successMessage = null), 4000);
  }
}
