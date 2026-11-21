import { Component, input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Room } from '../../../../models/room.model';
import { RoomCardComponent } from '../../../../components/room-card/room-card.component';

@Component({
  selector: 'app-room-section',
  standalone: true,
  imports: [CommonModule, RouterLink, RoomCardComponent],
  templateUrl: './room-section.component.html',
  styleUrl: './room-section.component.scss',
})
export class RoomSectionComponent implements OnInit, OnDestroy {
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

  getItems(): Room[] {
    return this.roomsArray();
  }

  visibleItems(): Room[] {
    const items = this.getItems();
    const total = items.length;
    if (total === 0) return [];
    if (total < 3) return items;
    const previous = (this.currentIndex - 1 + total) % total;
    const next = (this.currentIndex + 1) % total;
    return [items[previous], items[this.currentIndex], items[next]];
  }

  /**
   * Indica si la tarjeta en la posición i (dentro de visibleItems) es la principal.
   * - Con 3 o más habitaciones, la del centro es la posición 1.
   * - Con 1 o 2, visibleItems devuelve todas, así que la principal es currentIndex.
   * En celular solo se muestra la tarjeta principal.
   */
  isCenter(i: number): boolean {
    return this.getItems().length >= 3 ? i === 1 : i === this.currentIndex;
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
