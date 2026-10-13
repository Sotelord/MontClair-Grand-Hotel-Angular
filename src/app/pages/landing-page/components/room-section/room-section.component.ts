import { Component, input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomType } from '../../../../models/roomType.model';
import { Room } from '../../../../models/room.model';
import { RoomCardComponent } from '../../../../components/room-card/room-card.component';

@Component({
  selector: 'app-room-section',
  standalone: true,
  imports: [CommonModule, RoomCardComponent],
  templateUrl: './room-section.component.html',
  styleUrl: './room-section.component.scss',
})
export class RoomSectionComponent implements OnInit, OnDestroy {
  roomTypesArray = input<RoomType[]>([]);
  roomsArray = input<Room[]>([]);

  currentIndex: number = 0;
  intervalId: number = 0;
  intervalMs: number = 5000;

  ngOnInit(): void {
    this.startAutoplay();
  }

  ngOnDestroy(): void {
    window.clearInterval(this.intervalId);
  }

  getItems(): (RoomType | Room)[] {
    const rTypes = this.roomTypesArray();
    if (rTypes && rTypes.length > 0) {
      return rTypes;
    }
    const rooms = this.roomsArray();
    if (rooms && rooms.length > 0) {
      return rooms;
    }
    return [];
  }

  visibleItems(): (RoomType | Room)[] {
    const items = this.getItems();
    const total = items.length;
    if (total === 0) return [];
    if (total < 3) return items;
    const previous = (this.currentIndex - 1 + total) % total;
    const next = (this.currentIndex + 1) % total;
    return [items[previous], items[this.currentIndex], items[next]];
  }

  getRepresentativeRoom(item: RoomType | Room): Room | undefined {
    if ((item as any).number) {
      return item as Room;
    }
    const rtId = (item as RoomType).id;
    return this.roomsArray()?.find(
      (r) => r.roomType?.id === rtId || (r as any).typeId === rtId,
    );
  }

  getRoomType(item: RoomType | Room): RoomType | undefined {
    if ((item as any).number) {
      return (item as Room).roomType;
    }
    return item as RoomType;
  }

  next(): void {
    const total = this.getItems().length;
    if (total > 0) {
      this.currentIndex = (this.currentIndex + 1) % total;
    }
  }

  previous(): void {
    const total = this.getItems().length;
    if (total > 0) {
      this.currentIndex = (this.currentIndex - 1 + total) % total;
    }
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
