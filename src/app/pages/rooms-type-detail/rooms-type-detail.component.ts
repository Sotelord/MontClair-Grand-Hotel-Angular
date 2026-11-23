import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';
import { RoomTypeService } from '../../service/room-type.service';
import { RoomType } from '../../models/roomType.model';

@Component({
  selector: 'app-rooms-type-detail',
  standalone: true,
  imports: [PageHeaderComponent, RouterLink],
  templateUrl: './rooms-type-detail.component.html',
  styleUrl: './rooms-type-detail.component.scss',
})
export class RoomsTypeDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private roomTypeService = inject(RoomTypeService);

  roomTypeId = -1;
  roomType: RoomType | undefined;
  isLoading = true;

  readonly defaultImage =
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80';

  readonly highlights = [
    {
      title: 'Concierge 24/7',
      description:
        'Atención personalizada en todo momento para reservas, traslados y solicitudes especiales.',
    },
    {
      title: 'Confort MontClair',
      description:
        'Ropa de cama de algodón egipcio, climatización inteligente y aislamiento acústico total.',
    },
    {
      title: 'Conectividad & Trabajo',
      description:
        'Wi-Fi de fibra óptica de alta velocidad y espacio de escritorio ergonómico.',
    },
    {
      title: 'Experiencia Wellness',
      description:
        'Acceso preferencial a piscina climatizada, gimnasio y servicios de MontClair Spa.',
    },
  ];

  ngOnInit(): void {
    this.roomTypeId = Number(this.route.snapshot.params['id']);

    this.roomTypeService.findById(this.roomTypeId).subscribe({
      next: (rt) => {
        this.roomType = rt;
        this.isLoading = false;
      },
      error: () => {
        this.roomType = undefined;
        this.isLoading = false;
      },
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(price || 0);
  }
}
