import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { ClientService } from '../../service/client.service';
import { ReservationService } from '../../service/reservation.service';
import { RoomTypeService } from '../../service/room-type.service';
import { ServicesService } from '../../service/services.service';
import { Client } from '../../models/client.model';
import { RoomType } from '../../models/roomType.model';
import { Service } from '../../models/service.model';
import { ReservationRequestDTO } from '../../models/reservation.model';

@Component({
  selector: 'app-client-reservation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './client-reservation.component.html',
  styleUrl: './client-reservation.component.scss',
})
export class ClientReservationComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
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
  isEditMode = false;
  reservationId?: number;
  originalCheckInDate?: string;
  todayDate = '';

  ngOnInit(): void {
    this.initForm();

    const editIdParam = this.route.snapshot.paramMap.get('id');
    if (editIdParam) {
      this.isEditMode = true;
      this.reservationId = Number(editIdParam);
    }

    const queryClientId = Number(
      this.route.snapshot.queryParamMap.get('clientId')
    );
    const sessionClient = this.authService.getSession();

    if (sessionClient) {
      this.currentUser = sessionClient;
    }

    const id = (Number.isInteger(queryClientId) && queryClientId > 0)
      ? queryClientId
      : (sessionClient?.id || 0);

    if (id > 0) {
      this.clientService.findById(id).subscribe({
        next: client => {
          this.currentUser = client;
          this.authService.saveSession(client);
        },
        error: () => {
          this.currentUser = null;
          this.authService.clearSession();
          this.errorMessage = 'No se pudo cargar el cliente.';
        },
      });
    }

    const targetTypeId = Number(
      this.route.snapshot.queryParamMap.get('roomTypeId')
    );

    this.roomTypeService.findAll().subscribe({
      next: types => {
        this.roomTypes = types || [];

        if (!this.isEditMode) {
          this.selectedRoomType = this.roomTypes.find(
            t => t.id === targetTypeId
          ) || this.roomTypes[0] || null;

          if (this.selectedRoomType) {
            this.bookingForm.patchValue({
              roomTypeId: this.selectedRoomType.id
            });
          }
        } else if (this.reservationId) {
          this.loadReservation(this.reservationId);
        }
      },
      error: () => {
        this.errorMessage =
          'No se pudieron cargar los tipos de habitación.';
      },
    });

    this.servicesService.findNotHidden().subscribe({
      next: services => {
        this.services = (services || []).filter(s => (s.price ?? 0) > 0);
      },
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

  private loadReservation(id: number): void {
    this.reservationService.findById(id).subscribe({
      next: existing => {
        const reservationRoom = existing.reservationRooms?.[0];
        const currentRoomTypeId = reservationRoom?.room?.roomType?.id ?? null;

        this.originalCheckInDate = existing.checkInDate;

        this.bookingForm.patchValue({
          roomTypeId: currentRoomTypeId,
          checkInDate: existing.checkInDate,
          checkOutDate: existing.checkOutDate,
          numberOfPeople: existing.numberOfPeople,
        });

        this.selectedRoomType = this.roomTypes.find(
          t => t.id === Number(currentRoomTypeId)
        ) || this.roomTypes[0] || null;

        this.selectedServiceIds.clear();
        reservationRoom?.acquiredServices?.forEach(acquired => {
          if (acquired.service?.id != null && (acquired.service.price ?? 0) > 0) {
            this.selectedServiceIds.add(acquired.service.id);
          }
        });
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar la reserva solicitada.';
      },
    });
  }

  private formatLocal(offset: number): string {
    const day = new Date();
    day.setDate(day.getDate() + offset);

    const year = day.getFullYear();
    const month = String(day.getMonth() + 1).padStart(2, '0');
    const date = String(day.getDate()).padStart(2, '0');

    return `${year}-${month}-${date}`;
  }

  private initForm(): void {
    this.todayDate = this.formatLocal(0);

    this.bookingForm = this.fb.group({
      roomTypeId: [null, Validators.required],
      checkInDate: [this.formatLocal(1), Validators.required],
      checkOutDate: [this.formatLocal(4), Validators.required],
      numberOfPeople: [
        2,
        [Validators.required, Validators.min(1), Validators.max(10)]
      ],
      specialRequests: [''],
    });
  }

  get minCheckOutDate(): string {
    const checkIn = this.bookingForm?.get('checkInDate')?.value;
    if (!checkIn || typeof checkIn !== 'string') {
      return this.formatLocal(1);
    }
    const parts = checkIn.split('-').map(Number);
    if (parts.length !== 3 || parts.some(isNaN) || parts[0] > 9999) {
      return this.formatLocal(1);
    }
    const [year, month, day] = parts;
    const nextDay = new Date(year, month - 1, day + 1);
    if (isNaN(nextDay.getTime())) {
      return this.formatLocal(1);
    }
    const y = nextDay.getFullYear();
    const m = String(nextDay.getMonth() + 1).padStart(2, '0');
    const d = String(nextDay.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
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
        'Debes iniciar sesión para realizar la reserva.';
      return;
    }

    if (!this.selectedRoomType || !this.bookingForm.get('roomTypeId')?.value) {
      this.bookingForm.markAllAsTouched();
      this.errorMessage = 'Debes seleccionar un tipo de habitación.';
      return;
    }

    const val = this.bookingForm.value;

    const validationError = this.reservationService.validateReservationDatesAndGuests(
      val.checkInDate,
      val.checkOutDate,
      Number(val.numberOfPeople),
      this.isEditMode,
      this.originalCheckInDate,
    );

    if (validationError) {
      this.bookingForm.markAllAsTouched();
      this.errorMessage = validationError;
      return;
    }

    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      this.errorMessage =
        'Por favor completa todos los campos requeridos correctamente.';
      return;
    }

    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    const clientId = this.currentUser.id;

    const requestData: ReservationRequestDTO = {
      clientId,
      roomTypeId: Number(val.roomTypeId),
      checkInDate: val.checkInDate,
      checkOutDate: val.checkOutDate,
      numberOfPeople: Number(val.numberOfPeople),
      serviceIds: Array.from(this.selectedServiceIds),
    };

    const request$ = (this.isEditMode && this.reservationId)
      ? this.reservationService.update(this.reservationId, requestData)
      : this.reservationService.add(requestData);

    request$.subscribe({
      next: reservation => {
        this.isSubmitting = false;
        this.successMessage = this.isEditMode
          ? `¡Reserva #${reservation.id} actualizada!`
          : `¡Reserva #${reservation.id} confirmada!`;

        this.router.navigate(['/profile', clientId]);
      },
      error: err => {
        this.isSubmitting = false;

        if (typeof err?.error === 'string') {
          this.errorMessage = err.error;
        } else {
          this.errorMessage =
            err?.error?.message ||
            'No se pudo procesar la reserva. Puede que no haya habitaciones libres para esas fechas.';
        }
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
