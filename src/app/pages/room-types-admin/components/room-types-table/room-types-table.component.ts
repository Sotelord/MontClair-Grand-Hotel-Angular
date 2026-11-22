import { Component, input, output } from '@angular/core';
import { RoomType } from '../../../../models/roomType.model';

@Component({
  selector: 'app-room-types-table',
  imports: [],
  templateUrl: './room-types-table.component.html',
  styleUrl: './room-types-table.component.scss',
})
export class RoomTypesTableComponent {
  roomTypes = input.required<RoomType[]>();

  edit = output<RoomType>();
  delete = output<RoomType>();

  formatId(id: number): string {
    return '#' + String(id).padStart(3, '0');
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(price || 0);
  }

  onEdit(roomType: RoomType): void {
    this.edit.emit(roomType);
  }

  onDelete(roomType: RoomType): void {
    this.delete.emit(roomType);
  }
}
