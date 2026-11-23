import { Component, inject, OnInit } from '@angular/core';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { IntroductionComponent } from './components/introduction/introduction.component';
import { RoomsCarouselComponent } from './components/rooms-carousel/rooms-carousel.component';
import { BanerReservaComponent } from './components/baner-reserva/baner-reserva.component';
import { RoomTypeService } from '../../service/room-type.service';
import { RoomType } from '../../models/roomType.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-rooms-cards',
  imports: [
    PageHeaderComponent,
    IntroductionComponent,
    RoomsCarouselComponent,
    BanerReservaComponent,
  ],
  templateUrl: './rooms-cards.component.html',
  styleUrl: './rooms-cards.component.scss',
})
export class RoomsCardsComponent implements OnInit {
  router = inject(Router);

  private roomTypeService = inject(RoomTypeService);

  roomTypesArray: RoomType[] = [];

  ngOnInit(): void {
    this.roomTypeService.findAll().subscribe({
      next: (roomTypes) => {
        this.roomTypesArray = roomTypes || [];
      },
      error: () => {
        this.roomTypesArray = [];
      },
    });
  }

  verDetalleRoomType(roomType: RoomType): void {
    if (roomType.id) {
      this.router.navigate(['/rooms/type', roomType.id]);
    }
  }
}
