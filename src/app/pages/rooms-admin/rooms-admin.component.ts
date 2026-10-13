import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RoomService } from '../../service/room.service';
import { RoomTypeService } from '../../service/room-type.service';
import { ReservationService } from '../../service/reservation.service';
import { Room } from '../../models/room.model';
import { RoomType } from '../../models/roomType.model';
import { AdminPageHeaderComponent } from '../../components/admin-page-header/admin-page-header.component';

@Component({
  selector: 'app-rooms-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AdminPageHeaderComponent],
  templateUrl: './rooms-admin.component.html',
  styleUrl: './rooms-admin.component.scss',
})
export class RoomsAdminComponent implements OnInit {
  private roomService = inject(RoomService);
  private roomTypeService = inject(RoomTypeService);
  private reservationService = inject(ReservationService);
  private router = inject(Router);

  rooms: Room[] = [];
  roomTypes: RoomType[] = [];

  // Filter & Search
  searchTerm: string = '';
  selectedTypeId: string = 'ALL';
  selectedStatus: string = 'ALL';

  // Alerts
  successMessage: string | null = null;
  errorMessage: string | null = null;

  // Delete modal state
  roomToDelete: Room | null = null;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.roomService.findAll().subscribe({
      next: (rooms) => {
        this.rooms = rooms || [];
      },
      error: () => {
        this.rooms = [];
      },
    });
    this.roomTypeService.findAll().subscribe({
      next: (types) => {
        this.roomTypes = types || [];
      },
      error: () => {
        this.roomTypes = [];
      },
    });
  }

  get filteredRooms(): Room[] {
    return this.rooms.filter((room) => {
      const matchSearch =
        !this.searchTerm ||
        room.number.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (room.name && room.name.toLowerCase().includes(this.searchTerm.toLowerCase()));

      const matchType =
        this.selectedTypeId === 'ALL' ||
        (room.roomType && room.roomType.id === Number(this.selectedTypeId));

      const matchStatus =
        this.selectedStatus === 'ALL' || room.status === this.selectedStatus;

      return matchSearch && matchType && matchStatus;
    });
  }

  onAddRoom(): void {
    this.router.navigate(['/admin/rooms/add']);
  }

  onEditRoom(id: number): void {
    this.router.navigate(['/admin/rooms/edit', id]);
  }

  confirmDelete(room: Room): void {
    this.roomToDelete = room;
  }

  cancelDelete(): void {
    this.roomToDelete = null;
  }

  executeDelete(): void {
    if (!this.roomToDelete) return;

    if (this.reservationService.hasRoomReservations(this.roomToDelete.id)) {
      this.errorMessage = `No se puede eliminar la habitación #${this.roomToDelete.number} porque tiene reservaciones registradas.`;
      this.roomToDelete = null;
      setTimeout(() => (this.errorMessage = null), 6000);
      return;
    }

    const result = this.roomService.deleteRoom(this.roomToDelete.id);
    if (result.success) {
      this.successMessage = `Habitación #${this.roomToDelete.number} eliminada con éxito.`;
      this.loadData();
      setTimeout(() => (this.successMessage = null), 4000);
    } else {
      this.errorMessage = result.message || 'Error al eliminar la habitación.';
      setTimeout(() => (this.errorMessage = null), 6000);
    }
    this.roomToDelete = null;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  }

  formatId(id: number): string {
    return '#' + String(id).padStart(3, '0');
  }
}
