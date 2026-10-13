import { Component, inject, OnInit } from '@angular/core';
import { AdminPageHeaderComponent } from '../../components/admin-page-header/admin-page-header.component';
import { RoomTypesTableComponent } from './components/room-types-table/room-types-table.component';
import { RoomTypeService } from '../../service/room-type.service';
import { RoomService } from '../../service/room.service';
import { Router } from '@angular/router';
import { RoomType } from '../../models/roomType.model';

@Component({
  selector: 'app-room-types-admin',
  standalone: true,
  imports: [AdminPageHeaderComponent, RoomTypesTableComponent],
  templateUrl: './room-types-admin.component.html',
  styleUrl: './room-types-admin.component.scss',
})
export class RoomTypesAdminComponent implements OnInit {
  private roomTypeService = inject(RoomTypeService);
  private roomService = inject(RoomService);
  private router = inject(Router);

  roomTypes: RoomType[] = [];
  errorMessage: string | null = null;
  successMessage: string | null = null;

  ngOnInit(): void {
    this.loadRoomTypes();
  }

  loadRoomTypes(): void {
    this.roomTypeService.findAll().subscribe({
      next: (types) => {
        this.roomTypes = types || [];
      },
      error: () => {
        this.roomTypes = [];
      },
    });
  }

  onAdd(): void {
    this.router.navigate(['admin/room-types/add']);
  }

  onEdit(roomType: RoomType): void {
    this.router.navigate(['admin/room-types/edit', roomType.id]);
  }

  onDelete(roomType: RoomType): void {
    const assignedRooms = this.roomService.getRoomsByTypeId(roomType.id);
    if (assignedRooms.length > 0) {
      this.errorMessage = `No se puede eliminar la categoría '${roomType.name}' porque tiene ${assignedRooms.length} habitación(es) asociada(s).`;
      setTimeout(() => (this.errorMessage = null), 6000);
      return;
    }

    this.roomTypeService.delete(roomType.id).subscribe({
      next: () => {
        this.successMessage = `Categoría '${roomType.name}' eliminada correctamente.`;
        this.loadRoomTypes();
        setTimeout(() => (this.successMessage = null), 4000);
      },
      error: () => {
        this.errorMessage = 'Error al eliminar la categoría en el servidor.';
        setTimeout(() => (this.errorMessage = null), 6000);
      },
    });
  }
}
