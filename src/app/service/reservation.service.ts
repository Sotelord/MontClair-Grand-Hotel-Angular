import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Reservation,
  ReservationDTO,
  ReservationRequestDTO,
} from '../models/reservation.model';

@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/reservations';

  private static readonly MAX_STAY_NIGHTS = 30;
  private static readonly MAX_ADVANCE_YEARS = 1;
  private static readonly MIN_GUESTS = 1;
  private static readonly MAX_GUESTS = 10;

  findAll(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(this.apiUrl);
  }

  findSummary(): Observable<ReservationDTO[]> {
    return this.http.get<ReservationDTO[]>(
      `${this.apiUrl}/summary`,
    );
  }

  findById(id: number): Observable<Reservation> {
    return this.http.get<Reservation>(
      `${this.apiUrl}/${id}`,
    );
  }

  findByClientId(clientId: number): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(
      `${this.apiUrl}/client/${clientId}`,
    );
  }

  add(data: ReservationRequestDTO): Observable<Reservation> {
    return this.http.post<Reservation>(
      this.apiUrl,
      data,
    );
  }

  update(id: number, data: ReservationRequestDTO): Observable<Reservation> {
    return this.http.put<Reservation>(
      `${this.apiUrl}/${id}`,
      data,
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`,
    );
  }

  private parseIsoDateUtc(dateStr: string): number | null {
    if (!dateStr || typeof dateStr !== 'string') {
      return null;
    }
    const clean = dateStr.trim().replace(/^\+/, '');
    const parts = clean.split('-').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) {
      return null;
    }
    const [year, month, day] = parts;
    if (year < 1900 || month < 1 || month > 12 || day < 1 || day > 31) {
      return null;
    }
    const d = new Date(0);
    d.setUTCFullYear(year, month - 1, day);
    d.setUTCHours(0, 0, 0, 0);
    const time = d.getTime();
    return isNaN(time) ? null : time;
  }

  validateReservationDatesAndGuests(
    checkInDate: string,
    checkOutDate: string,
    numberOfPeople: number,
    isEditMode = false,
    originalCheckInDate?: string,
  ): string | null {
    if (!checkInDate || !checkOutDate) {
      return 'Las fechas de entrada y salida son obligatorias y deben ser válidas.';
    }

    const startUtc = this.parseIsoDateUtc(checkInDate);
    const endUtc = this.parseIsoDateUtc(checkOutDate);

    if (startUtc === null || endUtc === null) {
      return 'Las fechas de entrada y salida introducidas no son válidas.';
    }

    const now = new Date();
    const todayUtc = Date.UTC(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    if (!isEditMode || (originalCheckInDate && checkInDate !== originalCheckInDate)) {
      if (startUtc < todayUtc) {
        return isEditMode
          ? 'La nueva fecha de entrada no puede ser anterior a la fecha actual.'
          : 'La fecha de entrada no puede ser anterior a la fecha actual.';
      }
    }

    if (endUtc <= startUtc) {
      return 'La fecha de salida debe ser posterior a la fecha de entrada (mínimo 1 noche de estancia).';
    }

    const nights = Math.round((endUtc - startUtc) / (1000 * 60 * 60 * 24));
    if (nights > ReservationService.MAX_STAY_NIGHTS) {
      return `La estancia máxima permitida es de ${ReservationService.MAX_STAY_NIGHTS} noches consecutivas.`;
    }

    const maxAdvanceUtc = Date.UTC(
      now.getFullYear() + ReservationService.MAX_ADVANCE_YEARS,
      now.getMonth(),
      now.getDate(),
    );
    if (startUtc > maxAdvanceUtc) {
      return 'No se pueden realizar reservas con más de un año de anticipación.';
    }

    const guests = Number(numberOfPeople);
    if (isNaN(guests) || guests < ReservationService.MIN_GUESTS) {
      return `El número de huéspedes debe ser de al menos ${ReservationService.MIN_GUESTS} persona.`;
    }

    if (guests > ReservationService.MAX_GUESTS) {
      return `El número máximo de huéspedes permitido es de ${ReservationService.MAX_GUESTS} personas por habitación.`;
    }

    return null;
  }

  calculateNights(
    checkInDate: string,
    checkOutDate: string,
  ): number {
    const start = this.parseIsoDateUtc(checkInDate);
    const end = this.parseIsoDateUtc(checkOutDate);
    if (start === null || end === null) {
      return 1;
    }
    const diffDays = Math.round(
      (end - start) / (1000 * 60 * 60 * 24),
    );

    return diffDays > 0 ? diffDays : 1;
  }

  calculateRoomSubtotal(res: Reservation): number {
    const nights = this.calculateNights(
      res.checkInDate,
      res.checkOutDate,
    );

    const roomPrice =
      res.reservationRooms?.[0]?.pricePerNight ||
      res.reservationRooms?.[0]?.room?.pricePerNight ||
      0;

    return nights * roomPrice;
  }

  calculateServicesSubtotal(res: Reservation): number {
    const services =
      res.reservationRooms?.[0]?.acquiredServices || [];

    return services.reduce(
      (acc, curr) =>
        acc + curr.quantity * curr.unitPrice,
      0,
    );
  }

  calculateGrandTotal(res: Reservation): number {
    return (
      this.calculateRoomSubtotal(res) +
      this.calculateServicesSubtotal(res)
    );
  }
}
