import { Component, inject } from '@angular/core';

import { Service } from '../../models/service.model';

import { HeroComponent } from './components/hero/hero.component';
import { BookingBarComponent } from './components/booking-bar/booking-bar.component';
import { ServicesSectionComponent } from './components/services-section/services-section.component';
import { RoomSectionComponent } from './components/room-section/room-section.component';
import { GalleryBannerComponent } from './components/gallery-banner/gallery-banner.component';
import { LocationMapComponent } from './components/location-map/location-map.component';
import { ServicesService } from '../../service/services.service';
import { RoomTypeService } from '../../service/room-type.service';
import { RoomType } from '../../models/roomType.model';

@Component({
  selector: 'app-landing-page',
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
export class LandingPageComponent {
  title: string = 'MontClairGrandHotel';

  private serviceService = inject(ServicesService);
  private roomTypeService = inject(RoomTypeService);

  currentIndex: number = 0;
  intervalId: number = 0;
  intervalMs: number = 5000;

  serviceArray: Service[] = [];
  roomTypesArray: RoomType[] = [];

  ngOnInit() {
    this.serviceArray = this.serviceService.getServices();
    this.roomTypesArray = this.roomTypeService.getRoomTypes();
  }
}
