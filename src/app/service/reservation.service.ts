import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Reservation } from '../models/reservation.model';

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/reservations';

  findAll(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(this.apiUrl);
  }

  findById(id: number): Observable<Reservation> {
    return this.http.get<Reservation>(`${this.apiUrl}/${id}`);
  }

  findByClientId(clientId: number): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/client/${clientId}`);
  }

  add(data: any): Observable<Reservation> {
    return this.http.post<Reservation>(this.apiUrl, data);
  }

  update(id: number, data: any): Observable<Reservation> {
    return this.http.put<Reservation>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
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
}
