import { Component, input } from '@angular/core';
import { RoomType } from '../../../../models/roomType.model';
import { RoomCardComponent } from '../../../../components/room-card/room-card.component';

@Component({
  selector: 'app-room-section',
  imports: [RoomCardComponent],
  templateUrl: './room-section.component.html',
  styleUrl: './room-section.component.scss',
})
export class RoomSectionComponent {
  roomTypesArray = input.required<RoomType[]>();

  currentIndex: number = 0;
  intervalId: number = 0;
  intervalMs: number = 5000;

  ngOnInit(): void {
    this.startAutoplay();
  }

  ngOnDestroy(): void {
    window.clearInterval(this.intervalId);
  }

  visibleRoomTypes(): RoomType[] {
    const roomTypes = this.roomTypesArray();
    const total = roomTypes.length;
    if (total < 3) {
      return roomTypes;
    }
    const previous = (this.currentIndex - 1 + total) % total;
    const next = (this.currentIndex + 1) % total;
    return [roomTypes[previous], roomTypes[this.currentIndex], roomTypes[next]];
  }

  next(): void {
    this.currentIndex = (this.currentIndex + 1) % this.roomTypesArray().length;
  }

  previous(): void {
    const total = this.roomTypesArray().length;
    this.currentIndex = (this.currentIndex - 1 + total) % total;
  }

  onNextClick(): void {
    this.next();
    this.restartAutoplay();
  }

  onPreviousClick(): void {
    this.previous();
    this.restartAutoplay();
  }

  startAutoplay(): void {
    this.intervalId = window.setInterval(() => this.next(), this.intervalMs);
  }

  restartAutoplay(): void {
    window.clearInterval(this.intervalId);
    this.startAutoplay();
  }
}
