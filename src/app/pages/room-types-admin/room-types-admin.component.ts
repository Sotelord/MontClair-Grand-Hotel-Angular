import { Component, inject } from '@angular/core';
import { AdminPageHeaderComponent } from '../../components/admin-page-header/admin-page-header.component';
import { RoomTypesTableComponent } from './components/room-types-table/room-types-table.component';
import { RoomTypeService } from '../../service/room-type.service';
import { Router } from '@angular/router';
import { RoomType } from '../../models/roomType.model';

@Component({
  selector: 'app-room-types-admin',
  imports: [AdminPageHeaderComponent, RoomTypesTableComponent],
  templateUrl: './room-types-admin.component.html',
  styleUrl: './room-types-admin.component.scss',
})
export class RoomTypesAdminComponent {
  private roomTypeService = inject(RoomTypeService);
  private router = inject(Router);

  roomTypes: RoomType[] = [];

  ngOnInit(): void {
    this.roomTypes = this.roomTypeService.getRoomTypes();
  }

  onAdd(): void {
    this.router.navigate(['admin/room-types/add']);
  }

  onEdit(roomType: RoomType): void {
    this.router.navigate(['admin/room-types/edit', roomType.id]);
  }

  onDelete(roomType: RoomType): void {
    this.roomTypeService.deleteRoomType(roomType);
  }
}
