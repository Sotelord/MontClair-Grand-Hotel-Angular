import { Component, ElementRef, input, output, ViewChild } from '@angular/core';
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

  @ViewChild('carousel') carousel!: ElementRef<HTMLDivElement>;

  onRoomTypeSelected(roomType: RoomType): void {
    this.roomTypeSelected.emit(roomType);
  }

  scrollLeft(): void {
    if (this.carousel) {
      this.carousel.nativeElement.scrollBy({ left: -320, behavior: 'smooth' });
    }
  }

  scrollRight(): void {
    if (this.carousel) {
      this.carousel.nativeElement.scrollBy({ left: 320, behavior: 'smooth' });
    }
  }
}
