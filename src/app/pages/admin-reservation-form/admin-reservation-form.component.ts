
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReservationService } from '../../service/reservation.service';
import { ClientService } from '../../service/client.service';
import { RoomService } from '../../service/room.service';
import { ServicesService } from '../../service/services.service';
import { Client } from '../../models/client.model';
import { Room } from '../../models/room.model';
import { Service } from '../../models/service.model';

@Component({
  selector: 'app-admin-reservation-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './admin-reservation-form.component.html',
  styleUrl: './admin-reservation-form.component.scss',
})
export class AdminReservationFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private reservationService = inject(ReservationService);
  private clientService = inject(ClientService);
  private roomService = inject(RoomService);
  private servicesService = inject(ServicesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  reservationForm!: FormGroup;
  isEditMode: boolean = false;
  reservationId?: number;

  clients: Client[] = [];
  availableRooms: Room[] = [];
  services: Service[] = [];
  selectedServiceIds: Set<number> = new Set<number>();

  errorMessage: string | null = null;

  ngOnInit(): void {
    this.initForm();

    this.clientService.findAll().subscribe({
      next: (clients) => {
        this.clients = clients || [];

        if (
          this.clients.length > 0 &&
          !this.reservationForm.get('clientId')?.value
        ) {
          this.reservationForm.patchValue({
            clientId: this.clients[0].id,
          });
        }
      },
      error: () => {
        this.clients = [];
      },
    });

    this.servicesService.findNotHidden().subscribe({
      next: (services) => {
        this.services = services || [];
      },
      error: () => {
        this.services = [];
      },
    });

    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.isEditMode = true;
      this.reservationId = Number(idParam);

      this.reservationService.findById(this.reservationId).subscribe({
        next: (existing) => {
          const currentRoom = existing.reservationRooms?.[0]?.room;

          existing.reservationRooms?.[0]?.acquiredServices?.forEach(
            (acquired) => {
              if (acquired.service?.id) {
                this.selectedServiceIds.add(acquired.service.id);
              }
            },
          );

          this.reservationForm.patchValue({
            clientId: existing.client.id,
            roomId: currentRoom?.id,
            checkInDate: existing.checkInDate,
            checkOutDate: existing.checkOutDate,
            numberOfPeople: existing.numberOfPeople,
          });

          this.roomService.findAvailable().subscribe({
            next: (rooms) => {
              this.availableRooms = rooms || [];

              if (
                currentRoom &&
                !this.availableRooms.some(
                  (room) => room.id === currentRoom.id,
                )
              ) {
                this.availableRooms.unshift(currentRoom);
              }
            },
            error: () => {
              this.availableRooms = currentRoom
                ? [currentRoom]
                : [];
            },
          });
        },
        error: () => {
          this.router.navigate(['/admin/reservations']);
        },
      });
    } else {
      this.roomService.findAvailable().subscribe({
        next: (rooms) => {
          this.availableRooms = rooms || [];

          if (this.availableRooms.length > 0) {
            this.reservationForm.patchValue({
              roomId: this.availableRooms[0].id,
            });
          }
        },
        error: () => {
          this.availableRooms = [];
        },
      });
    }
  }

  private initForm(): void {
    const today = new Date().toISOString().split('T')[0];

    const defaultOut = new Date(
      Date.now() + 3 * 24 * 60 * 60 * 1000,
    )
      .toISOString()
      .split('T')[0];

    this.reservationForm = this.fb.group({
      clientId: [null, [Validators.required]],
      roomId: [null, [Validators.required]],
      checkInDate: [today, [Validators.required]],
      checkOutDate: [defaultOut, [Validators.required]],
      numberOfPeople: [
        2,
        [Validators.required, Validators.min(1)],
      ],
    });
  }

  toggleService(serviceId: number): void {
    if (this.selectedServiceIds.has(serviceId)) {
      this.selectedServiceIds.delete(serviceId);
    } else {
      this.selectedServiceIds.add(serviceId);
    }
  }

  isServiceSelected(serviceId: number): boolean {
    return this.selectedServiceIds.has(serviceId);
  }

  get nightsCount(): number {
    const checkIn = this.reservationForm?.get('checkInDate')?.value;
    const checkOut = this.reservationForm?.get('checkOutDate')?.value;

    if (!checkIn || !checkOut) return 1;

    return this.reservationService.calculateNights(
      checkIn,
      checkOut,
    );
  }

  get selectedRoomPrice(): number {
    const roomId = Number(
      this.reservationForm?.get('roomId')?.value,
    );

    const room = this.availableRooms.find(
      (item) => item.id === roomId,
    );

    return room?.pricePerNight || 0;
  }

  get estimatedRoomTotal(): number {
    return this.nightsCount * this.selectedRoomPrice;
  }

  get estimatedServicesTotal(): number {
    let total = 0;

    this.selectedServiceIds.forEach((id) => {
      const service = this.services.find(
        (item) => item.id === id,
      );

      if (service?.price) {
        total += service.price;
      }
    });

    return total;
  }

  get estimatedGrandTotal(): number {
    return (
      this.estimatedRoomTotal +
      this.estimatedServicesTotal
    );
  }

  onSubmit(): void {
    if (this.reservationForm.invalid) {
      this.reservationForm.markAllAsTouched();
      this.errorMessage =
        'Por favor completa todos los campos requeridos.';
      return;
    }

    const val = this.reservationForm.value;

    if (new Date(val.checkOutDate) <= new Date(val.checkInDate)) {
      this.errorMessage =
        'La fecha de salida debe ser posterior a la de entrada.';
      return;
    }

    const serviceIds = Array.from(this.selectedServiceIds);

    const reservationData = {
      clientId: Number(val.clientId),
      roomId: Number(val.roomId),
      checkInDate: val.checkInDate,
      checkOutDate: val.checkOutDate,
      numberOfPeople: Number(val.numberOfPeople),
      serviceIds,
    };

    if (this.isEditMode && this.reservationId) {
      this.reservationService
        .update(this.reservationId, reservationData)
        .subscribe({
          next: () => {
            this.router.navigate(['/admin/reservations']);
          },
          error: () => {
            this.errorMessage =
              'Error al actualizar la reserva en el servidor.';
          },
        });
    } else {
      this.reservationService.add(reservationData).subscribe({
        next: () => {
          this.router.navigate(['/admin/reservations']);
        },
        error: () => {
          this.errorMessage =
            'Error al crear la reserva en el servidor.';
        },
      });
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  }
}
