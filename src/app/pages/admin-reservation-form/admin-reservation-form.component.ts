
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
import { RoomTypeService } from '../../service/room-type.service';
import { ServicesService } from '../../service/services.service';
import { Client } from '../../models/client.model';
import { RoomType } from '../../models/roomType.model';
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
  private roomTypeService = inject(RoomTypeService);
  private servicesService = inject(ServicesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  reservationForm!: FormGroup;

  isEditMode = false;
  isSubmitting = false;
  reservationId?: number;

  clients: Client[] = [];
  roomTypes: RoomType[] = [];
  services: Service[] = [];

  selectedServiceIds = new Set<number>();

  errorMessage: string | null = null;

  ngOnInit(): void {
    this.initForm();
    this.loadClients();
    this.loadRoomTypes();
    this.loadServices();

    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.isEditMode = true;
      this.reservationId = Number(idParam);
      this.loadReservation(this.reservationId);
    }
  }

  private initForm(): void {
    const formatDate = (offset: number): string => {
      const date = new Date();
      date.setDate(date.getDate() + offset);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
    };

    this.reservationForm = this.fb.group({
      clientId: [null, Validators.required],
      roomTypeId: [null, Validators.required],
      checkInDate: [formatDate(0), Validators.required],
      checkOutDate: [formatDate(3), Validators.required],
      numberOfPeople: [
        2,
        [Validators.required, Validators.min(1)],
      ],
    });
  }

  private loadClients(): void {
    this.clientService.findAll().subscribe({
      next: (clients) => {
        this.clients = clients || [];

        if (
          !this.isEditMode &&
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
        this.errorMessage = 'No se pudieron cargar los clientes.';
      },
    });
  }

  private loadRoomTypes(): void {
    this.roomTypeService.findAll().subscribe({
      next: (types) => {
        this.roomTypes = types || [];

        if (
          !this.isEditMode &&
          this.roomTypes.length > 0 &&
          !this.reservationForm.get('roomTypeId')?.value
        ) {
          this.reservationForm.patchValue({
            roomTypeId: this.roomTypes[0].id,
          });
        }
      },
      error: () => {
        this.roomTypes = [];
        this.errorMessage =
          'No se pudieron cargar los tipos de habitación.';
      },
    });
  }

  private loadServices(): void {
    this.servicesService.findNotHidden().subscribe({
      next: (services) => {
        this.services = services || [];
      },
      error: () => {
        this.services = [];
      },
    });
  }

  private loadReservation(id: number): void {
    this.reservationService.findById(id).subscribe({
      next: (existing) => {
        const reservationRoom =
          existing.reservationRooms?.[0];

        const currentRoom = reservationRoom?.room;

        this.reservationForm.patchValue({
          clientId: existing.client.id,
          roomTypeId: currentRoom?.roomType?.id ?? null,
          checkInDate: existing.checkInDate,
          checkOutDate: existing.checkOutDate,
          numberOfPeople: existing.numberOfPeople,
        });

        this.selectedServiceIds.clear();

        reservationRoom?.acquiredServices?.forEach((acquired) => {
          if (acquired.service?.id != null) {
            this.selectedServiceIds.add(acquired.service.id);
          }
        });
      },
      error: () => {
        this.router.navigate(['/admin/reservations']);
      },
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
    return this.reservationService.calculateNights(
      this.reservationForm.get('checkInDate')?.value,
      this.reservationForm.get('checkOutDate')?.value,
    );
  }

  get selectedRoomPrice(): number {
    const selectedId = Number(
      this.reservationForm.get('roomTypeId')?.value,
    );

    const selectedType = this.roomTypes.find(
      (type) => type.id === selectedId,
    );

    return selectedType?.pricePerNight || 0;
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

      if (service) {
        total += service.price || 0;
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
    this.errorMessage = null;

    if (this.reservationForm.invalid) {
      this.reservationForm.markAllAsTouched();
      this.errorMessage =
        'Por favor completa todos los campos requeridos.';
      return;
    }

    const val = this.reservationForm.value;

    if (val.checkOutDate <= val.checkInDate) {
      this.errorMessage =
        'La fecha de salida debe ser posterior a la de entrada.';
      return;
    }

    if (this.isSubmitting) {
      return;
    }

    const reservationData = {
      clientId: Number(val.clientId),
      roomTypeId: Number(val.roomTypeId),
      checkInDate: val.checkInDate,
      checkOutDate: val.checkOutDate,
      numberOfPeople: Number(val.numberOfPeople),
      serviceIds: Array.from(this.selectedServiceIds),
    };

    this.isSubmitting = true;

    if (this.isEditMode && this.reservationId) {
      this.reservationService
        .update(this.reservationId, reservationData)
        .subscribe({
          next: () => {
            this.isSubmitting = false;
            this.router.navigate(['/admin/reservations']);
          },
          error: (err) => {
            this.isSubmitting = false;
            this.errorMessage = this.getErrorMessage(
              err,
              'No se pudo actualizar la reserva.',
            );
          },
        });
    } else {
      this.reservationService.add(reservationData).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.router.navigate(['/admin/reservations']);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.errorMessage = this.getErrorMessage(
            err,
            'No se pudo crear la reserva.',
          );
        },
      });
    }
  }

  private getErrorMessage(
    error: any,
    defaultMessage: string,
  ): string {
    if (typeof error?.error === 'string') {
      return error.error;
    }

    return error?.error?.message || defaultMessage;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  }
}
