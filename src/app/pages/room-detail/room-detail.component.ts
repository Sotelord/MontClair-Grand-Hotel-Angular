import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RoomService } from '../../service/room.service';
import { Room } from '../../models/room.model';

@Component({
  selector: 'app-room-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './room-detail.component.html',
  styleUrl: './room-detail.component.scss',
})
export class RoomDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private roomService = inject(RoomService);

  room?: Room;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.room = this.roomService.getRoomById(id);
    if (!this.room) {
      this.router.navigate(['/rooms/cards']);
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  }
}
