import { Component, input } from '@angular/core';
import { Room } from '../../../../models/room.model';
import { RoomItemCardComponent } from '../room-item-card/room-item-card.component';

import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-room-list-card',
  standalone: true,
  imports: [RoomItemCardComponent, RouterLink],
  templateUrl: './room-list-card.component.html',
  styleUrl: './room-list-card.component.scss',
})
export class RoomListCardComponent {
  rooms = input.required<Room[]>();
}
