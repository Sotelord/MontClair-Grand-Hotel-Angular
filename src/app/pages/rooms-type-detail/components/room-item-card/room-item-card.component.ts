import { Component, input } from '@angular/core';
import { Room } from '../../../../models/room.model';

import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-room-item-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './room-item-card.component.html',
  styleUrl: './room-item-card.component.scss',
})
export class RoomItemCardComponent {
  room = input.required<Room>();
}
