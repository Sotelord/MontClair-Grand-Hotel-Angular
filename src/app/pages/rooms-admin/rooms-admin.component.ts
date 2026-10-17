
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RoomService } from '../../service/room.service';
import { RoomTypeService } from '../../service/room-type.service';
import { Room, RoomStatus } from '../../models/room.model';
import { RoomType } from '../../models/roomType.model';
import { AdminPageHeaderComponent } from '../../components/admin-page-header/admin-page-header.component';

@Component({
  selector: 'app-rooms-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    AdminPageHeaderComponent
  ],
  templateUrl: './rooms-admin.component.html',
  styleUrl: './rooms-admin.component.scss',
})
export class RoomsAdminComponent implements OnInit {
  private roomService = inject(RoomService);
  private roomTypeService = inject(RoomTypeService);
  private router = inject(Router);

  rooms: Room[] = [];
  roomTypes: RoomType[] = [];

  selectedTypeId: string = 'ALL';
  selectedStatus: RoomStatus | 'ALL' = 'ALL';

  successMessage: string | null = null;
  errorMessage: string | null = null;

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
        this.errorMessage =
          'No se pudieron cargar las habitaciones.';
      },
    });

    this.roomTypeService.findAll().subscribe({
      next: (types) => {
        this.roomTypes = types || [];
      },
      error: () => {
        this.roomTypes = [];
        this.errorMessage =
          'No se pudieron cargar los tipos de habitación.';
      },
    });
  }

  get filteredRooms(): Room[] {
    return this.rooms.filter((room) => {
      const matchType =
        this.selectedTypeId === 'ALL' ||
        room.roomType?.id === Number(this.selectedTypeId);

      const matchStatus =
        this.selectedStatus === 'ALL' ||
        room.status === this.selectedStatus;

      return matchType && matchStatus;
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
    if (!this.roomToDelete) {
      return;
    }

    const roomNumber = this.roomToDelete.number;
    const roomId = this.roomToDelete.id;

    this.roomToDelete = null;
    this.errorMessage = null;

    this.roomService.delete(roomId).subscribe({
      next: () => {
        this.successMessage =
          `Habitación #${roomNumber} eliminada con éxito.`;

        this.loadData();

        setTimeout(() => {
          this.successMessage = null;
        }, 4000);
      },
      error: (err) => {
        this.errorMessage =
          err?.error?.message ||
          'Error al eliminar la habitación en el servidor.';

        setTimeout(() => {
          this.errorMessage = null;
        }, 6000);
      },
    });
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
