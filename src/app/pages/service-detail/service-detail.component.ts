import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ServicesService } from '../../service/services.service';
import { Service } from '../../models/service.model';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { ServiceImagesComponent } from './components/service-images/service-images.component';
import { ServiceHighlightsComponent } from './components/service-highlights/service-highlights.component';
import { ServiceSchedulePriceComponent } from './components/service-schedule-price/service-schedule-price.component';
import { ServiceGalleryComponent } from './components/service-gallery/service-gallery.component';

@Component({
  selector: 'app-service-detail',
  standalone: true,
  imports: [
    PageHeaderComponent,
    ServiceImagesComponent,
    ServiceHighlightsComponent,
    ServiceSchedulePriceComponent,
    ServiceGalleryComponent,
  ],
  templateUrl: './service-detail.component.html',
  styleUrl: './service-detail.component.scss',
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
      this.servicesService.findById(id).subscribe({
        next: (svc) => {
          if (svc && !svc.hidden) {
            this.service = svc;
          } else {
            this.router.navigate(['/services']);
          }
        },
        error: () => {
          this.router.navigate(['/services']);
        },
      });
    } else {
      this.router.navigate(['/services']);
    }
  }

  onReserve(): void {
    this.router.navigate(['/rooms/cards']);
  }
}
