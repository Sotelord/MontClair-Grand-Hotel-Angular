import { Component, inject, OnInit } from '@angular/core';
import { AdminPageHeaderComponent } from '../../components/admin-page-header/admin-page-header.component';
import { ServicesTableComponent } from './components/services-table/services-table.component';
import { ServicesService } from '../../service/services.service';
import { Router } from '@angular/router';
import { Service } from '../../models/service.model';
import { ErrorAlertComponent } from '../../components/error-alert/error-alert.component';

@Component({
  selector: 'app-services-admin',
  standalone: true,
  imports: [
    AdminPageHeaderComponent,
    ServicesTableComponent,
    ErrorAlertComponent,
  ],
  templateUrl: './services-admin.component.html',
  styleUrl: './services-admin.component.scss',
})
export class ServicesAdminComponent implements OnInit {
  private servicesService = inject(ServicesService);
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
    this.servicesService.delete(service.id).subscribe({
      next: () => {
        this.services = this.services.filter((item) => item.id !== service.id);
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
}
