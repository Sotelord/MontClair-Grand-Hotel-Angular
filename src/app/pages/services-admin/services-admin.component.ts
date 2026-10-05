import { Component, inject, OnInit } from '@angular/core';
import { AdminPageHeaderComponent } from '../../components/admin-page-header/admin-page-header.component';
import { ServicesTableComponent } from './components/services-table/services-table.component';
import { ServicesService } from '../../service/services.service';
import { Router } from '@angular/router';
import { Service } from '../../models/service.model';

@Component({
  selector: 'app-services-admin',
  standalone: true,
  imports: [AdminPageHeaderComponent, ServicesTableComponent],
  templateUrl: './services-admin.component.html',
  styleUrl: './services-admin.component.scss'
})
export class ServicesAdminComponent implements OnInit {
  private servicesService = inject(ServicesService);
  private router = inject(Router);

  services: Service[] = [];

  ngOnInit(): void {
    this.services = this.servicesService.getServices();
  }

  onAdd(): void {
    this.router.navigate(['admin/services/add']);
  }

  onEdit(service: Service): void {
    this.router.navigate(['admin/services/edit', service.id]);
  }

  onDelete(service: Service): void {
    this.servicesService.deleteService(service);
  }
}
