
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ClientService } from '../../service/client.service';
import { ReservationService } from '../../service/reservation.service';
import { RoomService } from '../../service/room.service';
import { ServicesService } from '../../service/services.service';
import { Client } from '../../models/client.model';
import { Room } from '../../models/room.model';
import { Service } from '../../models/service.model';

@Component({
  selector: 'app-client-reservation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './client-reservation.component.html',
  styleUrl: './client-reservation.component.scss',
})
export class ClientReservationComponent implements OnInit {
  private fb = inject(FormBuilder);
  private clientService = inject(ClientService);
  private reservationService = inject(ReservationService);
  private roomService = inject(RoomService);
  private servicesService = inject(ServicesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  bookingForm!: FormGroup;
  currentUser: Client | null = null;

  availableRooms: Room[] = [];
  services: Service[] = [];
  selectedServiceIds: Set<number> = new Set<number>();

  selectedRoom: Room | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isSubmitting: boolean = false;

  ngOnInit(): void {
    this.initForm();

    const clientIdParam =
      this.route.snapshot.queryParamMap.get('clientId');

    const clientId = clientIdParam
      ? Number(clientIdParam)
      : null;

    if (clientId && Number.isInteger(clientId) && clientId > 0) {
      this.clientService.findById(clientId).subscribe({
        next: (client) => {
          this.currentUser = client;
        },
        error: () => {
          this.currentUser = null;
          this.errorMessage =
            'No se pudo cargar la información del cliente.';
        },
      });
    }

    const paramRoomId =
      this.route.snapshot.paramMap.get('roomId');

    const queryRoomId =
      this.route.snapshot.queryParamMap.get('roomId');

    const targetRoomId = Number(
      paramRoomId || queryRoomId,
    );

    this.servicesService.findNotHidden().subscribe({
      next: (services) => {
        this.services = services || [];
      },
      error: () => {
        this.services = [];
      },
    });

    this.roomService.findAvailable().subscribe({
      next: (rooms) => {
        this.availableRooms = rooms || [];

        if (targetRoomId) {
          const room = this.availableRooms.find(
            (item) => item.id === targetRoomId,
          );

          if (room) {
            this.selectedRoom = room;
            this.bookingForm.patchValue({
              roomId: room.id,
            });
          } else {
            this.errorMessage =
              'La habitación seleccionada no está disponible.';

            if (this.availableRooms.length > 0) {
              this.selectedRoom = this.availableRooms[0];
              this.bookingForm.patchValue({
                roomId: this.selectedRoom.id,
              });
            }
          }
        } else if (this.availableRooms.length > 0) {
          this.selectedRoom = this.availableRooms[0];
          this.bookingForm.patchValue({
            roomId: this.selectedRoom.id,
          });
        }
      },
      error: () => {
        this.availableRooms = [];
        this.errorMessage =
          'No se pudieron consultar las habitaciones.';
      },
    });

    this.bookingForm
      .get('roomId')
      ?.valueChanges.subscribe((id) => {
        const numericId = Number(id);

        this.selectedRoom =
          this.availableRooms.find(
            (room) => room.id === numericId,
          ) || null;

        if (this.selectedRoom) {
          const currentGuests = Number(
            this.bookingForm.get('numberOfPeople')?.value || 1,
          );

          if (currentGuests > this.selectedRoom.capacity) {
            this.bookingForm.patchValue({
              numberOfPeople: this.selectedRoom.capacity,
            });
          }
        }
      });
  }

  private initForm(): void {
    const tomorrow = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    );

    const checkout = new Date(
      Date.now() + 4 * 24 * 60 * 60 * 1000,
    );

    const checkInDate = tomorrow.toISOString().split('T')[0];
    const checkOutDate = checkout.toISOString().split('T')[0];

    this.bookingForm = this.fb.group({
      roomId: [null, [Validators.required]],
      checkInDate: [checkInDate, [Validators.required]],
      checkOutDate: [checkOutDate, [Validators.required]],
      numberOfPeople: [
        2,
        [Validators.required, Validators.min(1)],
      ],
      specialRequests: [''],
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
    const checkIn =
      this.bookingForm?.get('checkInDate')?.value;

    const checkOut =
      this.bookingForm?.get('checkOutDate')?.value;

    if (!checkIn || !checkOut) {
      return 1;
    }

    return this.reservationService.calculateNights(
      checkIn,
      checkOut,
    );
  }

  get roomTotal(): number {
    if (!this.selectedRoom) {
      return 0;
    }

    return (
      this.nightsCount *
      this.selectedRoom.pricePerNight
    );
  }

  get servicesTotal(): number {
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

  get grandTotal(): number {
    return this.roomTotal + this.servicesTotal;
  }

  onSubmit(): void {
    if (!this.currentUser) {
      this.errorMessage =
        'Debes acceder desde tu perfil para realizar la reserva.';
      return;
    }

    const val = this.bookingForm.value;

    if (!val.roomId || !this.selectedRoom) {
      this.errorMessage =
        'Por favor seleccione una habitación disponible.';
      return;
    }

    if (!val.checkInDate || !val.checkOutDate) {
      this.errorMessage =
        'Por favor seleccione las fechas de llegada y salida.';
      return;
    }

    if (
      new Date(val.checkOutDate) <=
      new Date(val.checkInDate)
    ) {
      this.errorMessage =
        'La fecha de salida debe ser posterior a la fecha de llegada.';
      return;
    }

    const guests = Number(val.numberOfPeople);

    if (!guests || guests < 1) {
      this.errorMessage =
        'El número de huéspedes debe ser de al menos 1 persona.';
      return;
    }

    if (guests > this.selectedRoom.capacity) {
      this.errorMessage =
        `La habitación seleccionada (${this.selectedRoom.name}) ` +
        `tiene una capacidad máxima de ` +
        `${this.selectedRoom.capacity} personas.`;
      return;
    }

    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      this.errorMessage =
        'Por favor revise los campos requeridos.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    const clientId = this.currentUser.id;
    const serviceIds = Array.from(
      this.selectedServiceIds,
    );

    this.reservationService
      .add({
        clientId,
        roomId: Number(val.roomId),
        checkInDate: val.checkInDate,
        checkOutDate: val.checkOutDate,
        numberOfPeople: guests,
        serviceIds,
      })
      .subscribe({
        next: (reservation) => {
          this.isSubmitting = false;

          this.successMessage =
            `¡Su reserva #${reservation.id} ` +
            `ha sido confirmada con éxito!`;

          this.router.navigate([
            '/profile',
            clientId,
          ]);
        },
        error: () => {
          this.isSubmitting = false;
          this.errorMessage =
            'Error al procesar la reserva. Intente nuevamente.';
        },
      });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  }
}
