import { Component, inject } from '@angular/core';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { RoomListCardComponent } from './components/room-list-card/room-list-card.component';
import { ActivatedRoute } from '@angular/router';
import { RoomTypeService } from '../../service/room-type.service';
import { RoomType } from '../../models/roomType.model';
import { RoomService } from '../../service/room.service';
import { Room } from '../../models/room.model';

@Component({
  selector: 'app-rooms-type-detail',
  imports: [PageHeaderComponent, RoomListCardComponent],
  templateUrl: './rooms-type-detail.component.html',
  styleUrl: './rooms-type-detail.component.scss',
})
export class RoomsTypeDetailComponent {
  private route = inject(ActivatedRoute);
  private roomTypeService = inject(RoomTypeService);
  private roomService = inject(RoomService);

  roomTypeId = -1;

  roomType: RoomType | undefined;
  rooms: Room[] = [];

  ngOnInit() {
    this.roomTypeId = Number(this.route.snapshot.params['id']);
    this.roomType = this.roomTypeService.getRoomTypeById(this.roomTypeId);
    this.rooms = this.roomService.getRoomsByTypeId(this.roomTypeId);
  }
}
