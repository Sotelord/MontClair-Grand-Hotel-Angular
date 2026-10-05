import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServicesService } from '../../service/services.service';
import { Service } from '../../models/service.model';

@Component({
  selector: 'app-service-detail',
  standalone: true,
  imports: [],
  templateUrl: './service-detail.component.html',
  styleUrl: './service-detail.component.scss'
})
export class ServiceDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private servicesService = inject(ServicesService);

  service?: Service;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.service = this.servicesService.getServiceById(id);
      
      if (!this.service) {
        this.router.navigate(['/services']);
      }
    } else {
      this.router.navigate(['/services']);
    }
  }

  onReserve(): void {
    this.router.navigate(['/rooms/cards']);
  }
}
