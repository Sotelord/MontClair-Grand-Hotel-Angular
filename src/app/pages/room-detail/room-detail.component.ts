import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomService } from '../../service/room.service';
import { Room } from '../../models/room.model';
import { RoomBreadcrumbComponent } from './components/room-breadcrumb/room-breadcrumb.component';
import { RoomHeroComponent } from './components/room-hero/room-hero.component';
import { RoomHighlightsComponent } from './components/room-highlights/room-highlights.component';
import { RoomPricingComponent } from './components/room-pricing/room-pricing.component';

@Component({
  selector: 'app-room-detail',
  standalone: true,
  imports: [
    RoomBreadcrumbComponent,
    RoomHeroComponent,
    RoomHighlightsComponent,
    RoomPricingComponent,
  ],
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
    this.roomService.findById(id).subscribe({
      next: (room) => {
        if (room) {
          this.room = room;
        } else {
          this.router.navigate(['/rooms/cards']);
        }
      },
      error: () => {
        this.router.navigate(['/rooms/cards']);
      },
    });
  }
}
