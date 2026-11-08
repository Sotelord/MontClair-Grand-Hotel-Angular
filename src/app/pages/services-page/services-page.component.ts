import { Component, inject, OnInit } from '@angular/core';
import { ServicesService } from '../../service/services.service';
import { Service } from '../../models/service.model';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { ServiceCardComponent } from './components/service-card/service-card.component';

@Component({
  selector: 'app-services-page',
  standalone: true,
  imports: [PageHeaderComponent, ServiceCardComponent],
  templateUrl: './services-page.component.html',
  styleUrl: './services-page.component.scss',
})
export class ServicesPageComponent implements OnInit {
  private servicesService = inject(ServicesService);
  services: Service[] = [];

  ngOnInit(): void {
    this.servicesService.findNotHidden().subscribe({
      next: (services) => {
        this.services = services || [];
      },
      error: () => {
        this.services = [];
      },
    });
  }
}
