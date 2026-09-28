import { Component, input, output } from '@angular/core';
import { RoomType } from '../../models/roomType.model';

@Component({
  selector: 'app-room-card',
  imports: [],
  templateUrl: './room-card.component.html',
  styleUrl: './room-card.component.scss',
})
export class RoomCardComponent {
  roomType = input.required<RoomType>();
  compact = input<boolean>(false);

  showFeatures = input<boolean>(true);
  actionText = input<string>('Reservar');
  linkToDetail = input<boolean>(false);

  imageError: boolean = false;

  roomTypeSelected = output<RoomType>();

  verDetalle(): void {
    this.roomTypeSelected.emit(this.roomType());
  }

  isSuite(): boolean {
    return this.roomType().name.includes('Suite');
  }

  area(): number {
    return this.isSuite() ? 60 : 30;
  }

  capacity(): number {
    return this.isSuite() ? 4 : 2;
  }
}
