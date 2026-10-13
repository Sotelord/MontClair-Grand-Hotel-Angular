import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-booking-bar',
  standalone: true,
  imports: [],
  templateUrl: './booking-bar.component.html',
  styleUrl: './booking-bar.component.scss',
})
export class BookingBarComponent {
  private router = inject(Router);

  consultarDisponibilidad(): void {
    this.router.navigate(['/rooms/cards']);
  }
}
