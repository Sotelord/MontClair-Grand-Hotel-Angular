import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RoomType } from '../../models/roomType.model';
import { Room } from '../../models/room.model';
import { RoomService } from '../../service/room.service';

@Component({
  selector: 'app-room-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './room-card.component.html',
  styleUrl: './room-card.component.scss',
})
export class RoomCardComponent {
  private roomService = inject(RoomService);

  room = input<Room | undefined>(undefined);
  roomType = input<RoomType | undefined>(undefined);
  compact = input<boolean>(false);

  showFeatures = input<boolean>(true);
  actionText = input<string>('Reservar');
  linkToDetail = input<boolean>(false);

  imageError: boolean = false;

  roomTypeSelected = output<RoomType>();

  verDetalle(): void {
    if (this.roomType()) {
      this.roomTypeSelected.emit(this.roomType()!);
    }
  }

  getDbRoom(): Room | undefined {
    if (this.room()) return this.room();
    const rtId = this.roomType()?.id;
    if (rtId) {
      return this.roomService.getRooms().find(
        (r) => r.roomType?.id === rtId || (r as any).typeId === rtId,
      );
    }
    return undefined;
  }

  getRoomName(): string {
    const r = this.getDbRoom();
    if (r?.name) return r.name;
    return this.roomType()?.name || '';
  }

  getImageUrl(): string {
    const r = this.getDbRoom();
    if (r?.secondaryImageUrl) return r.secondaryImageUrl;
    if (r?.imageUrl) return r.imageUrl;
    const rtUrl = this.roomType()?.imageUrl;
    if (rtUrl) return rtUrl;
    if (r?.roomType?.imageUrl) return r.roomType.imageUrl;
    return 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=800&q=80';
  }

  getArea(): number {
    const r = this.getDbRoom();
    if (r?.area) return r.area;
    return 30;
  }

  getBedType(): string {
    const r = this.getDbRoom();
    if (r?.bedType) return r.bedType;
    return 'King Size';
  }

  getCapacity(): number {
    const r = this.getDbRoom();
    if (r?.capacity) return r.capacity;
    return 2;
  }

  getDescription(): string {
    const r = this.getDbRoom();
    if (r?.headline) return r.headline;
    if (r?.heroDescription) return r.heroDescription;
    return this.roomType()?.description || r?.roomType?.description || '';
  }

  getPrice(): number {
    const r = this.getDbRoom();
    if (r?.pricePerNight) return r.pricePerNight;
    return this.roomType()?.pricePerNight || 0;
  }

  getBookingLink(): (string | number)[] {
    const r = this.getDbRoom();
    if (r?.id) {
      return ['/reservations/book', r.id];
    }
    const rt = this.roomType();
    if (rt?.id) {
      return ['/rooms/type', rt.id];
    }
    return ['/reservations/book'];
  }
}
