import { Component, ElementRef, input, output, ViewChild } from '@angular/core';
import { Room } from '../../../../models/room.model';
import { RoomCardComponent } from '../../../../components/room-card/room-card.component';

@Component({
  selector: 'app-rooms-carousel',
  imports: [RoomCardComponent],
  templateUrl: './rooms-carousel.component.html',
  styleUrl: './rooms-carousel.component.scss',
})
export class RoomsCarouselComponent {
  roomsArray = input.required<Room[]>();
  roomSelected = output<Room>();

  @ViewChild('carousel') carousel!: ElementRef<HTMLDivElement>;

  onRoomSelected(room: Room): void {
    this.roomSelected.emit(room);
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
