import { Component, inject, OnInit } from '@angular/core';
import { AdminPageHeaderComponent } from '../../components/admin-page-header/admin-page-header.component';
import { RoomTypesTableComponent } from './components/room-types-table/room-types-table.component';
import { RoomTypeService } from '../../service/room-type.service';
import { Router } from '@angular/router';
import { RoomType } from '../../models/roomType.model';
import { SuccessAlertComponent } from '../../components/success-alert/success-alert.component';
import { ErrorAlertComponent } from '../../components/error-alert/error-alert.component';

@Component({
  selector: 'app-room-types-admin',
  standalone: true,
  imports: [
    AdminPageHeaderComponent,
    RoomTypesTableComponent,
    SuccessAlertComponent,
    ErrorAlertComponent,
  ],
  templateUrl: './room-types-admin.component.html',
  styleUrl: './room-types-admin.component.scss',
})
export class RoomTypesAdminComponent implements OnInit {
  private roomTypeService = inject(RoomTypeService);
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
    this.errorMessage = null;
    this.successMessage = null;

    this.roomTypeService.delete(roomType.id).subscribe({
      next: () => {
        this.successMessage = `Categoría '${roomType.name}' eliminada correctamente.`;

        this.loadRoomTypes();

        setTimeout(() => (this.successMessage = null), 4000);
      },
      error: (err) => {
        this.errorMessage =
          err.error?.message ||
          `No se pudo eliminar la categoría '${roomType.name}'. ` +
            'Verifica que no tenga habitaciones asociadas.';

        setTimeout(() => (this.errorMessage = null), 6000);
      },
    });
  }
}
