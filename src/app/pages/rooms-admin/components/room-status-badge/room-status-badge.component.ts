import { Component, input } from '@angular/core';
import { RoomStatus } from '../../../../models/room.model';

@Component({
  selector: 'app-room-status-badge',
  imports: [],
  templateUrl: './room-status-badge.component.html',
  styleUrl: './room-status-badge.component.scss',
  standalone: true,
})
export class RoomStatusBadgeComponent {
  status = input.required<RoomStatus>();
}
