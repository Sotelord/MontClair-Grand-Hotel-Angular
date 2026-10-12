import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { ClientService } from '../../service/client.service';
import { ReservationService } from '../../service/reservation.service';
import { Client } from '../../models/client.model';
import { Reservation } from '../../models/reservation.model';

@Component({
  selector: 'app-client-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './client-profile.component.html',
  styleUrl: './client-profile.component.scss',
})
export class ClientProfileComponent implements OnInit {
  authService = inject(AuthService);
  private clientService = inject(ClientService);
  private reservationService = inject(ReservationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  client: Client | null = null;
  reservations: Reservation[] = [];

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.client = this.clientService.getClientById(Number(idParam)) || null;
    } else {
      this.client = this.authService.currentUser();
    }

    if (!this.client) {
      this.router.navigate(['/login']);
      return;
    }

    this.reservations = this.reservationService.getReservationsByClientId(this.client.id);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  }
}
