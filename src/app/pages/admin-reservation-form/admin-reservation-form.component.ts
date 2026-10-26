import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ReservationService } from '../../service/reservation.service';
import { ClientService } from '../../service/client.service';
import { RoomTypeService } from '../../service/room-type.service';
import { ServicesService } from '../../service/services.service';
import { Client } from '../../models/client.model';
import { RoomType } from '../../models/roomType.model';
import { Service } from '../../models/service.model';
import { ReservationRequestDTO } from '../../models/reservation.model';
import { FormHeaderComponent } from './components/form-header/form-header.component';
import { ClientSelectComponent } from './components/client-select/client-select.component';
import { StayDetailsComponent } from './components/stay-details/stay-details.component';
import { RoomTypeSelectorComponent } from './components/room-type-selector/room-type-selector.component';
import { ServicesSelectorComponent } from './components/services-selector/services-selector.component';
import { PriceSummaryComponent } from './components/price-summary/price-summary.component';
import { FormActionsComponent } from './components/form-actions/form-actions.component';
import { ErrorAlertComponent } from '../../components/error-alert/error-alert.component';

@Component({
  selector: 'app-admin-reservation-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormHeaderComponent,
    ErrorAlertComponent,
    ClientSelectComponent,
    StayDetailsComponent,
    RoomTypeSelectorComponent,
    ServicesSelectorComponent,
    PriceSummaryComponent,
    FormActionsComponent,
  ],
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
  originalCheckInDate?: string;
  todayDate = '';

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

  private formatDate(offset: number): string {
    const date = new Date();
    date.setDate(date.getDate() + offset);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private initForm(): void {
    this.todayDate = this.formatDate(0);

    this.reservationForm = this.fb.group({
      clientId: [null, Validators.required],
      roomTypeId: [null, Validators.required],
      checkInDate: [this.todayDate, Validators.required],
      checkOutDate: [this.formatDate(3), Validators.required],
      numberOfPeople: [
        2,
        [Validators.required, Validators.min(1), Validators.max(10)],
      ],
    });
  }

  get minCheckOutDate(): string {
    const checkIn = this.reservationForm?.get('checkInDate')?.value;
    if (!checkIn || typeof checkIn !== 'string') {
      return this.formatDate(1);
    }
    const parts = checkIn.split('-').map(Number);
    if (parts.length !== 3 || parts.some(isNaN) || parts[0] > 9999) {
      return this.formatDate(1);
    }
    const [year, month, day] = parts;
    const nextDay = new Date(year, month - 1, day + 1);
    if (isNaN(nextDay.getTime())) {
      return this.formatDate(1);
    }
    const y = nextDay.getFullYear();
    const m = String(nextDay.getMonth() + 1).padStart(2, '0');
    const d = String(nextDay.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
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
        this.errorMessage = 'No se pudieron cargar los tipos de habitación.';
      },
    });
  }

  private loadServices(): void {
    this.servicesService.findNotHidden().subscribe({
      next: (services) => {
        this.services = (services || []).filter((s) => (s.price ?? 0) > 0);
      },
      error: () => {
        this.services = [];
      },
    });
  }

  private loadReservation(id: number): void {
    this.reservationService.findById(id).subscribe({
      next: (existing) => {
        const reservationRoom = existing.reservationRooms?.[0];

        const currentRoom = reservationRoom?.room;

        this.originalCheckInDate = existing.checkInDate;

        this.reservationForm.patchValue({
          clientId: existing.client.id,
          roomTypeId: currentRoom?.roomType?.id ?? null,
          checkInDate: existing.checkInDate,
          checkOutDate: existing.checkOutDate,
          numberOfPeople: existing.numberOfPeople,
        });

        this.selectedServiceIds.clear();

        reservationRoom?.acquiredServices?.forEach((acquired) => {
          if (
            acquired.service?.id != null &&
            (acquired.service.price ?? 0) > 0
          ) {
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

  get nightsCount(): number {
    return this.reservationService.calculateNights(
      this.reservationForm.get('checkInDate')?.value,
      this.reservationForm.get('checkOutDate')?.value,
    );
  }

  get selectedRoomPrice(): number {
    const selectedId = Number(this.reservationForm.get('roomTypeId')?.value);

    const selectedType = this.roomTypes.find((type) => type.id === selectedId);

    return selectedType?.pricePerNight || 0;
  }

  get estimatedRoomTotal(): number {
    return this.nightsCount * this.selectedRoomPrice;
  }

  get estimatedServicesTotal(): number {
    let total = 0;

    this.selectedServiceIds.forEach((id) => {
      const service = this.services.find((item) => item.id === id);

      if (service) {
        total += service.price || 0;
      }
    });

    return total;
  }

  get estimatedGrandTotal(): number {
    return this.estimatedRoomTotal + this.estimatedServicesTotal;
  }

  onSubmit(): void {
    this.errorMessage = null;

    const val = this.reservationForm.value;

    if (!val.clientId) {
      this.reservationForm.markAllAsTouched();
      this.errorMessage = 'Debes seleccionar un cliente.';
      return;
    }

    if (!val.roomTypeId) {
      this.reservationForm.markAllAsTouched();
      this.errorMessage = 'Debes seleccionar un tipo de habitación.';
      return;
    }

    const validationError =
      this.reservationService.validateReservationDatesAndGuests(
        val.checkInDate,
        val.checkOutDate,
        Number(val.numberOfPeople),
        this.isEditMode,
        this.originalCheckInDate,
      );

    if (validationError) {
      this.reservationForm.markAllAsTouched();
      this.errorMessage = validationError;
      return;
    }

    if (this.reservationForm.invalid) {
      this.reservationForm.markAllAsTouched();
      this.errorMessage =
        'Por favor completa todos los campos requeridos correctamente.';
      return;
    }

    if (this.isSubmitting) {
      return;
    }

    const reservationData: ReservationRequestDTO = {
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

  private getErrorMessage(error: any, defaultMessage: string): string {
    if (typeof error?.error === 'string') {
      return error.error;
    }

    return error?.error?.message || defaultMessage;
  }
}
