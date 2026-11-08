import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-booking-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking-bar.component.html',
  styleUrl: './booking-bar.component.scss',
})
export class BookingBarComponent implements OnInit {
  private router = inject(Router);

  checkIn: string = '';
  checkOut: string = '';
  guests: string = '2'; // Default: 2 Adultos
  todayDate: string = '';
  minCheckOutDate: string = '';

  ngOnInit(): void {
    const today = new Date();
    this.todayDate = this.formatDate(today);

    // Default Check-In: mañana
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.checkIn = this.formatDate(tomorrow);

    // Default Check-Out: 2 noches después
    const defaultCheckOut = new Date(tomorrow);
    defaultCheckOut.setDate(defaultCheckOut.getDate() + 2);
    this.checkOut = this.formatDate(defaultCheckOut);

    this.updateMinCheckOut();
  }

  private formatDate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private updateMinCheckOut(): void {
    if (!this.checkIn) return;
    const parts = this.checkIn.split('-').map(Number);
    if (parts.length === 3) {
      const nextDay = new Date(parts[0], parts[1] - 1, parts[2] + 1);
      this.minCheckOutDate = this.formatDate(nextDay);
    }
  }

  onCheckInChange(): void {
    this.updateMinCheckOut();
    if (this.checkIn && this.checkOut) {
      const inDate = new Date(this.checkIn + 'T00:00:00');
      const outDate = new Date(this.checkOut + 'T00:00:00');
      if (outDate <= inDate) {
        const newOut = new Date(inDate);
        newOut.setDate(newOut.getDate() + 2);
        this.checkOut = this.formatDate(newOut);
      }
    }
  }

  onCheckOutChange(): void {
    if (this.checkIn && this.checkOut) {
      const inDate = new Date(this.checkIn + 'T00:00:00');
      const outDate = new Date(this.checkOut + 'T00:00:00');
      if (outDate <= inDate) {
        const newOut = new Date(inDate);
        newOut.setDate(newOut.getDate() + 1);
        this.checkOut = this.formatDate(newOut);
      }
    }
  }

  openPicker(input: HTMLInputElement): void {
    if (!input) return;
    try {
      if (typeof input.showPicker === 'function') {
        input.showPicker();
        return;
      }
    } catch {
      // Navegadores que no soporten showPicker
    }
    input.focus();
  }

  formatDisplayDate(dateStr: string): string {
    if (!dateStr) return 'Seleccionar';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parts[0];
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const months = [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ];
    const monthName = months[monthIdx] || parts[1];
    return `${day} ${monthName} ${year}`;
  }

  consultarDisponibilidad(): void {
    let numGuests = 2;
    const parsed = parseInt(this.guests, 10);
    if (!isNaN(parsed) && parsed > 0) {
      numGuests = parsed;
    }

    this.router.navigate(['/reservations/book'], {
      queryParams: {
        checkIn: this.checkIn,
        checkOut: this.checkOut,
        guests: numGuests,
      },
    });
  }
}
