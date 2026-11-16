import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Service } from '../../models/service.model';
import { RoomType } from '../../models/roomType.model';

import { HeroComponent } from './components/hero/hero.component';
import { BookingBarComponent } from './components/booking-bar/booking-bar.component';
import { ServicesSectionComponent } from './components/services-section/services-section.component';
import { RoomSectionComponent } from './components/room-section/room-section.component';
import { GalleryBannerComponent } from './components/gallery-banner/gallery-banner.component';
import { LocationMapComponent } from './components/location-map/location-map.component';
import { ServicesService } from '../../service/services.service';
import { RoomTypeService } from '../../service/room-type.service';
import { AuthService } from '../../service/auth.service';
import { ClientService } from '../../service/client.service';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    HeroComponent,
    BookingBarComponent,
    ServicesSectionComponent,
    RoomSectionComponent,
    GalleryBannerComponent,
    LocationMapComponent,
  ],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.scss',
})
export class LandingPageComponent implements OnInit {
  title: string = 'MontClairGrandHotel';

  private serviceService = inject(ServicesService);
  private roomTypeService = inject(RoomTypeService);
  private authService = inject(AuthService);
  private clientService = inject(ClientService);
  private router = inject(Router);

  serviceArray: Service[] = [];
  roomTypesArray: RoomType[] = [];

  ngOnInit(): void {
    this.redirectIfLoggedIn();

    this.serviceService.findNotHidden().subscribe({
      next: (services) => {
        this.serviceArray = services || [];
      },
      error: () => {
        this.serviceArray = [];
      },
    });

    this.roomTypeService.findAll().subscribe({
      next: (types) => {
        this.roomTypesArray = types || [];
      },
      error: () => {
        this.roomTypesArray = [];
      },
    });
  }

  private redirectIfLoggedIn(): void {
    if (!this.authService.getToken()) {
      return;
    }

    this.clientService.getMyDetails().subscribe({
      next: (client) => {
        this.authService.saveSession(client);

        const role = client.role?.toUpperCase();
        if (role === 'ADMIN') {
          this.router.navigate(['/admin/rooms']);
        } else if (role === 'OPERATOR' || role === 'OPERARIO') {
          this.router.navigate(['/operator/reservations']);
        } else {
          this.router.navigate(['/profile']);
        }
      },
      error: () => {
        this.authService.clearSession();
      },
    });
  }
}
