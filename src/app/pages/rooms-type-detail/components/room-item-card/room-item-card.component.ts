import { Component, input } from '@angular/core';
import { Room } from '../../../../models/room.model';

@Component({
  selector: 'app-room-item-card',
  imports: [],
  templateUrl: './room-item-card.component.html',
  styleUrl: './room-item-card.component.scss',
})
export class RoomItemCardComponent {
  room = input.required<Room>();
}
