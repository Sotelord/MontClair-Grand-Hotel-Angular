import { Component, input, output } from '@angular/core';
import { RoomType } from '../../../../models/roomType.model';
import { RoomCardComponent } from '../../../../components/room-card/room-card.component';

@Component({
  selector: 'app-rooms-carousel',
  imports: [RoomCardComponent],
  templateUrl: './rooms-carousel.component.html',
  styleUrl: './rooms-carousel.component.scss',
})
export class RoomsCarouselComponent {
  roomTypesArray = input.required<RoomType[]>();

  roomTypeSelected = output<RoomType>();

  onRoomTypeSelected(roomType: RoomType): void {
    this.roomTypeSelected.emit(roomType);
  }
}
