import { Component, input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoomType } from '../../../../models/roomType.model';
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

  currentIndex: number = 0;
  intervalId: number = 0;
  intervalMs: number = 5000;

  ngOnInit(): void {
    this.startAutoplay();
  }

  ngOnDestroy(): void {
    window.clearInterval(this.intervalId);
  }

  getItems(): RoomType[] {
    return this.roomTypesArray();
  }

  visibleItems(): RoomType[] {
    const items = this.getItems();
    const total = items.length;
    if (total === 0) return [];
    if (total < 3) return items;
    const previous = (this.currentIndex - 1 + total) % total;
    const next = (this.currentIndex + 1) % total;
    return [items[previous], items[this.currentIndex], items[next]];
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
