import { Component, input } from '@angular/core';
import { Room } from '../../../../models/room.model';

@Component({
  selector: 'app-room-hero',
  imports: [],
  templateUrl: './room-hero.component.html',
  styleUrl: './room-hero.component.scss',
  standalone: true,
})
export class RoomHeroComponent {
  room = input.required<Room>();
}
