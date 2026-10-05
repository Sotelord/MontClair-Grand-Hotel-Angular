import { Component, inject, OnInit } from '@angular/core';
import { ServicesService } from '../../service/services.service';
import { Service } from '../../models/service.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-services-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './services-page.component.html',
  styleUrl: './services-page.component.scss'
})
export class ServicesPageComponent implements OnInit {
  private servicesService = inject(ServicesService);
  services: Service[] = [];

  ngOnInit(): void {
    this.services = this.servicesService.getServices();
  }
}
