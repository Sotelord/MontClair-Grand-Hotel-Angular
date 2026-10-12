import { Injectable, inject } from '@angular/core';
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
  private clientService = inject(ClientService);
  private roomService = inject(RoomService);
  private servicesService = inject(ServicesService);

  private reservations: Reservation[] = [];

  constructor() {
    this.initReservations();
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
    const roomPrice = res.reservationRooms?.[0]?.pricePerNight || res.reservationRooms?.[0]?.room?.pricePerNight || 0;
    return nights * roomPrice;
  }

  calculateServicesSubtotal(res: Reservation): number {
    const services = res.reservationRooms?.[0]?.acquiredServices || [];
    return services.reduce((acc, curr) => acc + (curr.quantity * curr.unitPrice), 0);
  }

  calculateGrandTotal(res: Reservation): number {
    return this.calculateRoomSubtotal(res) + this.calculateServicesSubtotal(res);
  }

  addReservation(data: {
    clientId: number;
    roomId: number;
    checkInDate: string;
    checkOutDate: string;
    numberOfPeople: number;
    serviceIds?: number[];
  }): { success: boolean; message?: string; reservation?: Reservation } {
    const client = this.clientService.getClientById(data.clientId);
    if (!client) {
      return { success: false, message: 'El cliente seleccionado no existe.' };
    }

    const room = this.roomService.getRoomById(data.roomId);
    if (!room) {
      return { success: false, message: 'La habitación seleccionada no existe.' };
    }

    if (new Date(data.checkOutDate) <= new Date(data.checkInDate)) {
      return { success: false, message: 'La fecha de salida debe ser posterior a la de entrada.' };
    }

    const nextId = this.reservations.length > 0 ? Math.max(...this.reservations.map((r) => r.id)) + 1 : 1;

    const acquiredServices: AcquiredService[] = [];
    if (data.serviceIds && data.serviceIds.length > 0) {
      data.serviceIds.forEach((svcId, idx) => {
        const svc = this.servicesService.getServiceById(svcId);
        if (svc) {
          acquiredServices.push({
            id: nextId * 100 + idx + 1,
            reservationRoom: null as any,
            service: svc,
            date: data.checkInDate,
            quantity: 1,
            unitPrice: svc.price || 0,
          });
        }
      });
    }

    const resRoom: ReservationRoom = {
      id: nextId,
      room,
      pricePerNight: room.pricePerNight,
      acquiredServices,
    };

    const newReservation: Reservation = {
      id: nextId,
      client,
      checkInDate: data.checkInDate,
      checkOutDate: data.checkOutDate,
      numberOfPeople: data.numberOfPeople,
      status: 'CONFIRMED',
      reservationRooms: [resRoom],
    };

    // Update room status to OCCUPIED
    this.roomService.updateRoom({
      ...room,
      status: 'OCCUPIED',
    });

    this.reservations.unshift(newReservation);
    return { success: true, reservation: newReservation };
  }

  updateReservation(
    id: number,
    data: {
      clientId: number;
      roomId?: number;
      checkInDate: string;
      checkOutDate: string;
      numberOfPeople: number;
      serviceIds?: number[];
    }
  ): { success: boolean; message?: string } {
    const index = this.reservations.findIndex((r) => r.id === id);
    if (index === -1) {
      return { success: false, message: 'La reserva no fue encontrada.' };
    }

    const client = this.clientService.getClientById(data.clientId);
    if (!client) {
      return { success: false, message: 'El cliente seleccionado no existe.' };
    }

    if (new Date(data.checkOutDate) <= new Date(data.checkInDate)) {
      return { success: false, message: 'La fecha de salida debe ser posterior a la de entrada.' };
    }

    const existingRes = this.reservations[index];
    let resRoom = existingRes.reservationRooms?.[0];

    // If room is changed
    if (data.roomId && (!resRoom || resRoom.room.id !== data.roomId)) {
      const newRoom = this.roomService.getRoomById(data.roomId);
      if (newRoom) {
        // Free old room
        if (resRoom?.room) {
          this.roomService.updateRoom({ ...resRoom.room, status: 'AVAILABLE' });
        }
        // Occupy new room
        this.roomService.updateRoom({ ...newRoom, status: 'OCCUPIED' });

        resRoom = {
          id: resRoom ? resRoom.id : id,
          room: newRoom,
          pricePerNight: newRoom.pricePerNight,
          acquiredServices: resRoom?.acquiredServices || [],
        };
      }
    }

    // Update acquired services
    if (data.serviceIds !== undefined && resRoom) {
      const acquiredServices: AcquiredService[] = [];
      data.serviceIds.forEach((svcId, idx) => {
        const svc = this.servicesService.getServiceById(svcId);
        if (svc) {
          acquiredServices.push({
            id: id * 100 + idx + 1,
            reservationRoom: null as any,
            service: svc,
            date: data.checkInDate,
            quantity: 1,
            unitPrice: svc.price || 0,
          });
        }
      });
      resRoom.acquiredServices = acquiredServices;
    }

    this.reservations[index] = {
      ...existingRes,
      client,
      checkInDate: data.checkInDate,
      checkOutDate: data.checkOutDate,
      numberOfPeople: data.numberOfPeople,
      reservationRooms: resRoom ? [resRoom] : existingRes.reservationRooms,
    };

    return { success: true };
  }

  deleteReservation(id: number): { success: boolean; message?: string } {
    const index = this.reservations.findIndex((r) => r.id === id);
    if (index === -1) {
      return { success: false, message: 'La reserva no existe.' };
    }

    const res = this.reservations[index];
    // Free the assigned room
    const room = res.reservationRooms?.[0]?.room;
    if (room) {
      this.roomService.updateRoom({ ...room, status: 'AVAILABLE' });
    }

    this.reservations.splice(index, 1);
    return { success: true };
  }

  hasClientReservations(clientId: number): boolean {
    return this.reservations.some((r) => r.client?.id === clientId);
  }

  hasRoomReservations(roomId: number): boolean {
    return this.reservations.some((r) => r.reservationRooms?.some((rr) => rr.room?.id === roomId));
  }

  private initReservations(): void {
    const clients = this.clientService.getClients();
    const rooms = this.roomService.getRooms();
    const services = this.servicesService.getServices();

    if (clients.length === 0 || rooms.length === 0) return;

    const baseReservations = [
      {
        id: 1,
        client: clients[0] || this.clientService.getClientById(1)!,
        room: rooms[0],
        checkInDate: '2026-10-15',
        checkOutDate: '2026-10-18',
        numberOfPeople: 2,
        status: 'CONFIRMED',
        services: [services[0], services[1]].filter(Boolean),
      },
      {
        id: 2,
        client: clients[1] || this.clientService.getClientById(2)!,
        room: rooms[1],
        checkInDate: '2026-10-16',
        checkOutDate: '2026-10-20',
        numberOfPeople: 2,
        status: 'CONFIRMED',
        services: [services[1]].filter(Boolean),
      },
      {
        id: 3,
        client: clients[2] || this.clientService.getClientById(3)!,
        room: rooms[2],
        checkInDate: '2026-10-18',
        checkOutDate: '2026-10-22',
        numberOfPeople: 3,
        status: 'CONFIRMED',
        services: [services[2]].filter(Boolean),
      },
      {
        id: 4,
        client: clients[3] || this.clientService.getClientById(4)!,
        room: rooms[3],
        checkInDate: '2026-10-20',
        checkOutDate: '2026-10-25',
        numberOfPeople: 2,
        status: 'CONFIRMED',
        services: [services[3], services[4]].filter(Boolean),
      },
      {
        id: 5,
        client: clients[4] || this.clientService.getClientById(5)!,
        room: rooms[4],
        checkInDate: '2026-10-22',
        checkOutDate: '2026-10-26',
        numberOfPeople: 4,
        status: 'CONFIRMED',
        services: [services[0]].filter(Boolean),
      },
    ];

    this.reservations = baseReservations.map((b) => {
      const acqServices: AcquiredService[] = b.services.map((s, idx) => ({
        id: b.id * 10 + idx + 1,
        reservationRoom: null as any,
        service: s,
        date: b.checkInDate,
        quantity: idx === 0 ? 2 : 1,
        unitPrice: s.price || 40.0,
      }));

      const resRoom: ReservationRoom = {
        id: b.id,
        room: b.room,
        pricePerNight: b.room.pricePerNight,
        acquiredServices: acqServices,
      };

      return {
        id: b.id,
        client: b.client,
        checkInDate: b.checkInDate,
        checkOutDate: b.checkOutDate,
        numberOfPeople: b.numberOfPeople,
        status: b.status,
        reservationRooms: [resRoom],
      };
    });
  }
}
