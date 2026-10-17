
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ClientService } from '../../service/client.service';
import { ReservationService } from '../../service/reservation.service';
import { RoomTypeService } from '../../service/room-type.service';
import { ServicesService } from '../../service/services.service';
import { Client } from '../../models/client.model';
import { RoomType } from '../../models/roomType.model';
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
  private roomTypeService = inject(RoomTypeService);
  private servicesService = inject(ServicesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  bookingForm!: FormGroup;
  currentUser: Client | null = null;
  roomTypes: RoomType[] = [];
  selectedRoomType: RoomType | null = null;
  services: Service[] = [];
  selectedServiceIds = new Set<number>();
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isSubmitting = false;

  ngOnInit(): void {
    this.initForm();

    const id = Number(
      this.route.snapshot.queryParamMap.get('clientId')
    );

    if (Number.isInteger(id) && id > 0) {
      this.clientService.findById(id).subscribe({
        next: client => this.currentUser = client,
        error: () => this.errorMessage = 'No se pudo cargar el cliente.',
      });
    }

    const targetTypeId = Number(
      this.route.snapshot.queryParamMap.get('roomTypeId')
    );

    this.roomTypeService.findAll().subscribe({
      next: types => {
        this.roomTypes = types || [];

        this.selectedRoomType = this.roomTypes.find(
          t => t.id === targetTypeId
        ) || this.roomTypes[0] || null;

        if (this.selectedRoomType) {
          this.bookingForm.patchValue({
            roomTypeId: this.selectedRoomType.id
          });
        }
      },
      error: () => {
        this.errorMessage =
          'No se pudieron cargar los tipos de habitación.';
      },
    });

    this.servicesService.findNotHidden().subscribe({
      next: services => this.services = services || [],
      error: () => this.services = [],
    });

    this.bookingForm.get('roomTypeId')?.valueChanges.subscribe(
      value => {
        this.selectedRoomType = this.roomTypes.find(
          t => t.id === Number(value)
        ) || null;
      }
    );
  }

  private initForm(): void {
    const formatLocal = (offset: number): string => {
      const day = new Date();
      day.setDate(day.getDate() + offset);

      const year = day.getFullYear();
      const month = String(day.getMonth() + 1).padStart(2, '0');
      const date = String(day.getDate()).padStart(2, '0');

      return `${year}-${month}-${date}`;
    };

    this.bookingForm = this.fb.group({
      roomTypeId: [null, Validators.required],
      checkInDate: [formatLocal(1), Validators.required],
      checkOutDate: [formatLocal(4), Validators.required],
      numberOfPeople: [
        2,
        [Validators.required, Validators.min(1)]
      ],
      specialRequests: [''],
    });
  }

  toggleService(id: number): void {
    if (this.selectedServiceIds.has(id)) {
      this.selectedServiceIds.delete(id);
    } else {
      this.selectedServiceIds.add(id);
    }
  }

  isServiceSelected(id: number): boolean {
    return this.selectedServiceIds.has(id);
  }

  get nightsCount(): number {
    return this.reservationService.calculateNights(
      this.bookingForm.get('checkInDate')?.value,
      this.bookingForm.get('checkOutDate')?.value,
    );
  }

  get roomTotal(): number {
    return this.nightsCount *
      (this.selectedRoomType?.pricePerNight || 0);
  }

  get servicesTotal(): number {
    return this.services
      .filter(service => this.selectedServiceIds.has(service.id))
      .reduce(
        (sum, service) => sum + (service.price || 0),
        0
      );
  }

  get grandTotal(): number {
    return this.roomTotal + this.servicesTotal;
  }

  onSubmit(): void {
    this.errorMessage = null;

    if (!this.currentUser) {
      this.errorMessage =
        'Debes acceder desde tu perfil para realizar la reserva.';
      return;
    }

    if (this.bookingForm.invalid || !this.selectedRoomType) {
      this.bookingForm.markAllAsTouched();

      this.errorMessage =
        'Selecciona un tipo de habitación y completa los campos.';
      return;
    }

    const val = this.bookingForm.value;

    if (val.checkOutDate <= val.checkInDate) {
      this.errorMessage =
        'La fecha de salida debe ser posterior a la de entrada.';
      return;
    }

    this.isSubmitting = true;

    const clientId = this.currentUser.id;

    this.reservationService.add({
      clientId,
      roomTypeId: Number(val.roomTypeId),
      checkInDate: val.checkInDate,
      checkOutDate: val.checkOutDate,
      numberOfPeople: Number(val.numberOfPeople),
      serviceIds: Array.from(this.selectedServiceIds),
    }).subscribe({
      next: reservation => {
        this.isSubmitting = false;
        this.successMessage =
          `¡Reserva #${reservation.id} confirmada!`;

        this.router.navigate(['/profile', clientId]);
      },
      error: err => {
        this.isSubmitting = false;

        this.errorMessage =
          typeof err.error === 'string'
            ? err.error
            : 'No se pudo crear la reserva. Puede que no haya habitaciones libres para esas fechas.';
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
