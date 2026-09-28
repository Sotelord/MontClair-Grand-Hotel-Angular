import { Component, input } from '@angular/core';
import { Room } from '../../../../models/room.model';
import { RoomItemCardComponent } from '../room-item-card/room-item-card.component';

@Component({
  selector: 'app-room-list-card',
  imports: [RoomItemCardComponent],
  templateUrl: './room-list-card.component.html',
  styleUrl: './room-list-card.component.scss',
})
export class RoomListCardComponent {
  rooms = input.required<Room[]>();
}
