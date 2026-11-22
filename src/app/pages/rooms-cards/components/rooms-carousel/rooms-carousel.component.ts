import {
  Component,
  effect,
  ElementRef,
  HostListener,
  input,
  output,
  signal,
  ViewChild,
} from '@angular/core';
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

  canScrollPrev = signal(false);
  canScrollNext = signal(true);

  constructor() {
    effect(() => {
      this.roomsArray();
      setTimeout(() => this.updateButtons());
    });
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateButtons();
  }

  onRoomSelected(room: Room): void {
    this.roomSelected.emit(room);
  }

  private getStep(): number {
    const el = this.carousel?.nativeElement;
    if (!el) return 0;
    const slide = el.querySelector<HTMLElement>('.carousel-slide');
    if (!slide) return el.clientWidth;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    return slide.offsetWidth + gap;
  }

  scrollPrev(): void {
    this.carousel?.nativeElement.scrollBy({
      left: -this.getStep(),
      behavior: 'smooth',
    });
  }

  scrollNext(): void {
    this.carousel?.nativeElement.scrollBy({
      left: this.getStep(),
      behavior: 'smooth',
    });
  }

  updateButtons(): void {
    const el = this.carousel?.nativeElement;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    this.canScrollPrev.set(el.scrollLeft > 4);
    this.canScrollNext.set(el.scrollLeft < maxScroll - 4);
  }
}
