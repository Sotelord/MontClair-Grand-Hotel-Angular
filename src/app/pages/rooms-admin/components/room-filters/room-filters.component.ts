import { Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RoomType } from '../../../../models/roomType.model';
import { RoomStatus } from '../../../../models/room.model';

@Component({
  selector: 'app-room-filters',
  imports: [FormsModule, RouterLink],
  templateUrl: './room-filters.component.html',
  styleUrl: './room-filters.component.scss',
  standalone: true,
})
export class RoomFiltersComponent {
  roomTypes = input.required<RoomType[]>();
  total = input.required<number>();
  selectedTypeId = model<string>('ALL');
  selectedStatus = model<RoomStatus | 'ALL'>('ALL');
}
