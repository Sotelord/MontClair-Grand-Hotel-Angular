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
  imports: [CommonModule, FormsModule, RouterLink, RoomItemCardComponent],
  templateUrl: './room-list-card.component.html',
  styleUrl: './room-list-card.component.scss',
})
export class RoomListCardComponent {
  rooms = input.required<Room[]>();
  roomType = input<RoomType | undefined>();

  filterAvailability: 'ALL' | 'AVAILABLE' | 'OCCUPIED' = 'ALL';
  filterFloor: number | 'ALL' = 'ALL';
  searchQuery = '';
  sortBy: 'number' | 'priceAsc' | 'priceDesc' | 'floor' = 'number';

  get totalCount(): number {
    return this.rooms().length;
  }

  get availableCount(): number {
    return this.rooms().filter((r) => r.status === 'AVAILABLE').length;
  }

  get occupiedCount(): number {
    return this.rooms().filter((r) => r.status === 'OCCUPIED').length;
  }

  get floors(): number[] {
    const floorSet = new Set<number>();
    this.rooms().forEach((r) => {
      if (r.floor != null) floorSet.add(r.floor);
    });
    return Array.from(floorSet).sort((a, b) => a - b);
  }

  get filteredRooms(): Room[] {
    let list = [...this.rooms()];

    const avail = this.filterAvailability;
    if (avail !== 'ALL') {
      list = list.filter((r) => r.status === avail);
    }

    const floor = this.filterFloor;
    if (floor !== 'ALL') {
      list = list.filter((r) => r.floor === floor);
    }

    const q = this.searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (r) =>
          (r.number && r.number.toLowerCase().includes(q)) ||
          (r.name && r.name.toLowerCase().includes(q)) ||
          (r.bedType && r.bedType.toLowerCase().includes(q)),
      );
    }

    const sort = this.sortBy;
    if (sort === 'number') {
      list.sort((a, b) =>
        (a.number || '').localeCompare(b.number || '', undefined, {
          numeric: true,
        }),
      );
    } else if (sort === 'priceAsc') {
      list.sort((a, b) => a.pricePerNight - b.pricePerNight);
    } else if (sort === 'priceDesc') {
      list.sort((a, b) => b.pricePerNight - a.pricePerNight);
    } else if (sort === 'floor') {
      list.sort((a, b) => a.floor - b.floor);
    }

    return list;
  }

  setAvailability(status: 'ALL' | 'AVAILABLE' | 'OCCUPIED'): void {
    this.filterAvailability = status;
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
    this.filterAvailability = 'ALL';
    this.filterFloor = 'ALL';
    this.searchQuery = '';
    this.sortBy = 'number';
  }
}
