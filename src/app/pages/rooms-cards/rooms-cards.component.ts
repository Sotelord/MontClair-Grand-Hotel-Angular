import { Component, inject, OnInit } from '@angular/core';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { IntroductionComponent } from './components/introduction/introduction.component';
import { RoomsCarouselComponent } from './components/rooms-carousel/rooms-carousel.component';
import { BanerReservaComponent } from './components/baner-reserva/baner-reserva.component';
import { RoomService } from '../../service/room.service';
import { Room } from '../../models/room.model';
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

  private roomService = inject(RoomService);

  roomsArray: Room[] = [];

  ngOnInit(): void {
    this.roomService.findAll().subscribe({
      next: (rooms) => {
        this.roomsArray = rooms || [];
      },
      error: () => {
        this.roomsArray = [];
      },
    });
  }

  verDetalleRoom(room: Room): void {
    if (room.roomType?.id) {
      this.router.navigate(['/rooms/type', room.roomType.id]);
    }
  }
}
