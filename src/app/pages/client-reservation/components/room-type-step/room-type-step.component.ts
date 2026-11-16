import { Component, inject, input, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RoomType } from '../../../../models/roomType.model';
import { Room } from '../../../../models/room.model';
import { ReservationDTO } from '../../../../models/reservation.model';
import { RoomService } from '../../../../service/room.service';
import { ReservationService } from '../../../../service/reservation.service';

@Component({
  selector: 'app-room-type-step',
  imports: [ReactiveFormsModule],
  templateUrl: './room-type-step.component.html',
  styleUrl: './room-type-step.component.scss',
  standalone: true,
})
export class RoomTypeStepComponent implements OnInit {
  private roomService = inject(RoomService);
  private reservationService = inject(ReservationService);

  form = input.required<FormGroup>();
  roomTypes = input.required<RoomType[]>();
  selectedRoomType = input<RoomType | null>(null);

  allRooms: Room[] = [];
  allReservations: ReservationDTO[] = [];

  ngOnInit(): void {
    this.roomService.findAll().subscribe({
      next: (rooms) => (this.allRooms = rooms || []),
    });
    this.reservationService.findSummary().subscribe({
      next: (res) => (this.allReservations = res || []),
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
    const occupied = this.allReservations.some(
      (res) =>
        res.status !== 'CANCELLED' &&
        res.status !== 'INACTIVE' &&
        (res.roomId === room.id || res.roomNumber === room.number) &&
        res.checkInDate < checkOut &&
        res.checkOutDate > checkIn,
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
