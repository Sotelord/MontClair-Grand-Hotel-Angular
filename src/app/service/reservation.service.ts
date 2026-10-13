import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Reservation } from '../models/reservation.model';
import { ReservationRoom } from '../models/reservationRoom.model';
import { AcquiredService } from '../models/adquiredService.model';
import { ClientService } from './client.service';
import { RoomService } from './room.service';
import { ServicesService } from './services.service';

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/reservations';

  private reservations: Reservation[] = [];

  findAll(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(this.apiUrl).pipe(
      tap((data) => {
        if (data) {
          this.reservations = data;
        }
      }),
    );
  }

  findById(id: number): Observable<Reservation> {
    return this.http.get<Reservation>(`${this.apiUrl}/${id}`);
  }

  findByClientId(clientId: number): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/client/${clientId}`);
  }

  add(data: any): Observable<Reservation> {
    return this.http.post<Reservation>(this.apiUrl, data).pipe(
      tap((saved) => {
        if (saved) {
          this.reservations.unshift(saved);
        }
      }),
    );
  }

  update(id: number, data: any): Observable<Reservation> {
    return this.http.put<Reservation>(`${this.apiUrl}/${id}`, data).pipe(
      tap((updated) => {
        const idx = this.reservations.findIndex((r) => r.id === id);
        if (idx !== -1) {
          this.reservations[idx] = updated;
        }
      }),
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.reservations = this.reservations.filter((r) => r.id !== id);
      }),
    );
  }

  getReservations(): Reservation[] {
    return this.reservations;
  }

  getReservationById(id: number): Reservation | undefined {
    return this.reservations.find((item) => item.id === id);
  }

  getReservationsByClientId(clientId: number): Reservation[] {
    return this.reservations.filter((item) => item.client.id === clientId);
  }

  calculateNights(checkInDate: string, checkOutDate: string): number {
    try {
      const start = new Date(checkInDate).getTime();
      const end = new Date(checkOutDate).getTime();
      const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 1;
    } catch {
      return 1;
    }
  }

  calculateRoomSubtotal(res: Reservation): number {
    const nights = this.calculateNights(res.checkInDate, res.checkOutDate);
    const roomPrice =
      res.reservationRooms?.[0]?.pricePerNight ||
      res.reservationRooms?.[0]?.room?.pricePerNight ||
      0;
    return nights * roomPrice;
  }

  calculateServicesSubtotal(res: Reservation): number {
    const services = res.reservationRooms?.[0]?.acquiredServices || [];
    return services.reduce(
      (acc, curr) => acc + curr.quantity * curr.unitPrice,
      0,
    );
  }

  calculateGrandTotal(res: Reservation): number {
    return (
      this.calculateRoomSubtotal(res) + this.calculateServicesSubtotal(res)
    );
  }

  hasClientReservations(clientId: number): boolean {
    return this.reservations.some((r) => r.client?.id === clientId);
  }

  hasRoomReservations(roomId: number): boolean {
    return this.reservations.some((r) =>
      r.reservationRooms?.some((rr) => rr.room?.id === roomId),
    );
  }
}
