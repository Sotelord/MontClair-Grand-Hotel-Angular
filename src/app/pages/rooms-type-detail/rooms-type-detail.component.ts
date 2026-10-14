import { Component, inject, OnInit } from '@angular/core';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { RoomListCardComponent } from './components/room-list-card/room-list-card.component';
import { ActivatedRoute } from '@angular/router';
import { RoomTypeService } from '../../service/room-type.service';
import { RoomType } from '../../models/roomType.model';
import { RoomService } from '../../service/room.service';
import { Room } from '../../models/room.model';
import { mergeMap } from 'rxjs';

@Component({
  selector: 'app-rooms-type-detail',
  imports: [PageHeaderComponent, RoomListCardComponent],
  templateUrl: './rooms-type-detail.component.html',
  styleUrl: './rooms-type-detail.component.scss',
})
export class RoomsTypeDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private roomTypeService = inject(RoomTypeService);
  private roomService = inject(RoomService);

  roomTypeId = -1;
  roomType: RoomType | undefined;
  rooms: Room[] = [];

  ngOnInit(): void {
    this.roomTypeId = Number(this.route.snapshot.params['id']);

    // Uso de mergeMap para consultas anidadas/relacionadas (Patrón RxJS Video 2 y 3)
    this.roomTypeService.findById(this.roomTypeId).pipe(
      mergeMap((rt) => {
        this.roomType = rt;
        return this.roomService.findByTypeId(this.roomTypeId);
      })
    ).subscribe({
      next: (rooms) => {
        this.rooms = rooms || [];
      },
      error: () => {
        this.rooms = [];
      },
    });
  }
}
