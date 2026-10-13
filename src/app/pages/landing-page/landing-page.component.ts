import { Component, inject, OnInit } from '@angular/core';

import { Service } from '../../models/service.model';
import { RoomType } from '../../models/roomType.model';
import { Room } from '../../models/room.model';

import { HeroComponent } from './components/hero/hero.component';
import { BookingBarComponent } from './components/booking-bar/booking-bar.component';
import { ServicesSectionComponent } from './components/services-section/services-section.component';
import { RoomSectionComponent } from './components/room-section/room-section.component';
import { GalleryBannerComponent } from './components/gallery-banner/gallery-banner.component';
import { LocationMapComponent } from './components/location-map/location-map.component';
import { ServicesService } from '../../service/services.service';
import { RoomTypeService } from '../../service/room-type.service';
import { RoomService } from '../../service/room.service';

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
  private roomService = inject(RoomService);

  serviceArray: Service[] = [];
  roomTypesArray: RoomType[] = [];
  roomsArray: Room[] = [];

  ngOnInit(): void {
    this.serviceService.services$.subscribe((services) => {
      this.serviceArray = services || [];
    });

    this.roomTypeService.roomTypes$.subscribe((types) => {
      this.roomTypesArray = types || [];
    });

    this.roomService.rooms$.subscribe((rooms) => {
      this.roomsArray = rooms || [];
    });

    this.serviceService.findAll().subscribe();
    this.roomTypeService.findAll().subscribe();
    this.roomService.findAll().subscribe();
  }
}
