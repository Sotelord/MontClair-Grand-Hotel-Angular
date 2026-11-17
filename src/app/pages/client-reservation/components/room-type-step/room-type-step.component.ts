import { Component, inject, input, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RoomType } from '../../../../models/roomType.model';
import { Room } from '../../../../models/room.model';
import { OccupiedRoomRange, RoomService } from '../../../../service/room.service';

@Component({
  selector: 'app-room-type-step',
  imports: [ReactiveFormsModule],
  templateUrl: './room-type-step.component.html',
  styleUrl: './room-type-step.component.scss',
  standalone: true,
})
export class RoomTypeStepComponent implements OnInit {
  private roomService = inject(RoomService);

  form = input.required<FormGroup>();
  roomTypes = input.required<RoomType[]>();
  selectedRoomType = input<RoomType | null>(null);

  allRooms: Room[] = [];
  occupiedRanges: OccupiedRoomRange[] = [];

  ngOnInit(): void {
    this.roomService.findAll().subscribe({
      next: (rooms) => (this.allRooms = rooms || []),
    });
    this.roomService.getOccupiedRanges().subscribe({
      next: (ranges) => (this.occupiedRanges = ranges || []),
      error: () => (this.occupiedRanges = []),
    });
  }

  get roomsOfSelectedType(): Room[] {
    const selectedId = this.selectedRoomType()?.id;
    if (!selectedId) return [];
    return this.allRooms.filter((r) => r.roomType?.id === selectedId);
  }

  isRoomAvailable(room: Room): boolean {
    if (room.status && room.status !== 'AVAILABLE') {
      return false;
    }
    const checkIn = this.form()?.get('checkInDate')?.value;
    const checkOut = this.form()?.get('checkOutDate')?.value;
    if (!checkIn || !checkOut) {
      return true;
    }
    const occupied = this.occupiedRanges.some(
      (range) =>
        (range.roomId === room.id || range.roomNumber === room.number) &&
        range.checkInDate < checkOut &&
        range.checkOutDate > checkIn,
    );
    return !occupied;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  }
}
