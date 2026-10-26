import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Reservation,
  ReservationDTO,
  ReservationRequestDTO,
} from '../models/reservation.model';

//Acceso a la API REST de reservas (/api/reservations) y reglas de negocio que se validan en el cliente: fechas, huéspedes y cálculo de totales.
@Injectable({
  providedIn: 'root',
})
export class ReservationService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/reservations';

  //Límites de negocio para validar una reserva.
  private static readonly MAX_STAY_NIGHTS = 30;
  private static readonly MAX_ADVANCE_YEARS = 1;
  private static readonly MIN_GUESTS = 1;
  private static readonly MAX_GUESTS = 10;

  //Lista todas las reservas con su detalle completo.
  findAll(): Observable<ReservationDTO[]> {
    return this.http.get<ReservationDTO[]>(this.apiUrl);
  }

  //Lista las reservas en formato resumido (DTO plano), usado en el panel de administración.
  findSummary(): Observable<ReservationDTO[]> {
    return this.http.get<ReservationDTO[]>(`${this.apiUrl}/summary`);
  }

  //Busca una reserva por su id (devuelve el DTO plano sin objetos anidados circulares).
  findById(id: number): Observable<ReservationDTO> {
    return this.http.get<ReservationDTO>(`${this.apiUrl}/${id}`);
  }

  //Lista las reservas de un cliente para su historial (perfil del huésped).
  findByClientId(clientId: number): Observable<ReservationDTO[]> {
    return this.http.get<ReservationDTO[]>(`${this.apiUrl}/client/${clientId}`);
  }

  //Crea una reserva. Recibe el DTO de solicitud, no la entidad completa.
  add(data: ReservationRequestDTO): Observable<ReservationDTO> {
    return this.http.post<ReservationDTO>(this.apiUrl, data);
  }

  //Actualiza una reserva existente (PUT).
  update(id: number, data: ReservationRequestDTO): Observable<ReservationDTO> {
    return this.http.put<ReservationDTO>(`${this.apiUrl}/${id}`, data);
  }

  //Cancela una reserva lógicamente (cambia su estado a CANCELLED y preserva el historial).
  cancel(id: number): Observable<ReservationDTO> {
    return this.http.patch<ReservationDTO>(`${this.apiUrl}/${id}/cancel`, {});
  }

  //Activa la estadía de un cliente cuando este llega al hotel (estado pasa a ACTIVE).
  activate(id: number): Observable<ReservationDTO> {
    return this.http.patch<ReservationDTO>(`${this.apiUrl}/${id}/activate`, {});
  }

  //Finaliza la estadía de un cliente (estado pasa a INACTIVE; solo permitido si ya pagó).
  finish(id: number): Observable<ReservationDTO> {
    return this.http.patch<ReservationDTO>(`${this.apiUrl}/${id}/finish`, {});
  }

  //Paga la cuenta de una estadía. Se limpia la cuenta del cliente (paid = true, saldo = 0).
  pay(id: number): Observable<ReservationDTO> {
    return this.http.patch<ReservationDTO>(`${this.apiUrl}/${id}/pay`, {});
  }

  //Asigna un servicio consumido a una habitacion (REGLA 5: requiere reserva activa en la habitacion).
  assignServiceToRoom(roomId: number, serviceId: number, quantity: number = 1): Observable<ReservationDTO> {
    return this.http.post<ReservationDTO>(`${this.apiUrl}/rooms/${roomId}/services`, {
      serviceId,
      quantity,
    });
  }
  //Elimina una reserva (en backend ejecuta la cancelación lógica para conservar historial).
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /*Convierte una fecha "YYYY-MM-DD" a milisegundos en UTC a medianoche. Se usa UTC para que la zona horaria o el horario de verano no alteren
  la diferencia de días entre dos fechas.*/
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

  /*Valida fechas y número de huéspedes de una reserva. Reglas: fechas válidas, entrada no pasada, salida posterior a la entrada,
  máximo de noches, máximo un año de anticipación y huéspedes entre 1 y 10.*/
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
    const todayUtc = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

    if (
      !isEditMode ||
      (originalCheckInDate && checkInDate !== originalCheckInDate)
    ) {
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

  /*Calcula las noches entre dos fechas "YYYY-MM-DD". Si alguna fecha es inválida o la diferencia no es positiva devuelve 1,
  para que los totales mostrados nunca queden en 0 noches.*/
  calculateNights(checkInDate: string, checkOutDate: string): number {
    const start = this.parseIsoDateUtc(checkInDate);
    const end = this.parseIsoDateUtc(checkOutDate);
    if (start === null || end === null) {
      return 1;
    }
    const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : 1;
  }

  //Subtotal de la estancia: noches × tarifa por noche.
  calculateRoomSubtotal(res: Reservation | ReservationDTO): number {
    const nights = this.calculateNights(res.checkInDate, res.checkOutDate);

    const roomPrice =
      (res as any).pricePerNight ||
      res.reservationRooms?.[0]?.pricePerNight ||
      res.reservationRooms?.[0]?.room?.pricePerNight ||
      0;

    return nights * roomPrice;
  }

  //Subtotal de servicios: suma de cantidad × precio unitario de cada servicio contratado.
  calculateServicesSubtotal(res: Reservation | ReservationDTO): number {
    const dtoServices = (res as ReservationDTO).services;
    if (dtoServices && dtoServices.length > 0) {
      return dtoServices.reduce((acc: number, curr: any) => acc + (curr.subtotal ?? curr.quantity * curr.unitPrice), 0);
    }

    const services = res.reservationRooms?.[0]?.acquiredServices || [];

    return services.reduce(
      (acc: number, curr: any) => acc + curr.quantity * curr.unitPrice,
      0,
    );
  }

  //Total de la reserva: estancia + servicios.
  calculateGrandTotal(res: Reservation | ReservationDTO): number {
    return (
      this.calculateRoomSubtotal(res) + this.calculateServicesSubtotal(res)
    );
  }
}
