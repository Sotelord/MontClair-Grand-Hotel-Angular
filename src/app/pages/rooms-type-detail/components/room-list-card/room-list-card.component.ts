import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Room } from '../../../../models/room.model';
import { RoomType } from '../../../../models/roomType.model';
import { RoomItemCardComponent } from '../room-item-card/room-item-card.component';

@Component({
  selector: 'app-room-list-card',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    RoomItemCardComponent
  ],
  templateUrl: './room-list-card.component.html',
  styleUrl: './room-list-card.component.scss',
})
export class RoomListCardComponent {
  rooms = input.required<Room[]>();
  roomType = input<RoomType | undefined>();

  filterFloor: number | 'ALL' = 'ALL';
  searchQuery = '';
  sortBy: 'number' | 'priceAsc' | 'priceDesc' | 'floor' = 'number';

  get availableRooms(): Room[] {
    return this.rooms().filter((room) => room.status === 'AVAILABLE');
  }

  get availableCount(): number {
    return this.availableRooms.length;
  }

  get floors(): number[] {
    const floorSet = new Set<number>();

    this.availableRooms.forEach((room) => {
      if (room.floor != null) {
        floorSet.add(room.floor);
      }
    });

    return Array.from(floorSet).sort((a, b) => a - b);
  }

  get filteredRooms(): Room[] {
    let list = [...this.availableRooms];

    if (this.filterFloor !== 'ALL') {
      list = list.filter((room) => room.floor === this.filterFloor);
    }

    const query = this.searchQuery.trim().toLowerCase();

    if (query) {
      list = list.filter(
        (room) =>
          (room.number || '').toLowerCase().includes(query) ||
          (room.name || '').toLowerCase().includes(query) ||
          (room.bedType || '').toLowerCase().includes(query)
      );
    }

    if (this.sortBy === 'number') {
      list.sort((a, b) =>
        (a.number || '').localeCompare(b.number || '', undefined, {
          numeric: true,
        })
      );
    } else if (this.sortBy === 'priceAsc') {
      list.sort((a, b) => a.pricePerNight - b.pricePerNight);
    } else if (this.sortBy === 'priceDesc') {
      list.sort((a, b) => b.pricePerNight - a.pricePerNight);
    } else if (this.sortBy === 'floor') {
      list.sort((a, b) => a.floor - b.floor);
    }

    return list;
  }

  setFloor(floor: number | 'ALL'): void {
    this.filterFloor = floor;
  }

  setSort(sort: 'number' | 'priceAsc' | 'priceDesc' | 'floor'): void {
    this.sortBy = sort;
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery = input.value;
  }

  resetFilters(): void {
    this.filterFloor = 'ALL';
    this.searchQuery = '';
    this.sortBy = 'number';
  }
}
