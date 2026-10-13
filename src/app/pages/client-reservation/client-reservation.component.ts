import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../service/auth.service';
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
  authService = inject(AuthService);
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
    this.currentUser = this.authService.currentUser();
    this.initForm();

    const paramRoomId = this.route.snapshot.paramMap.get('roomId');
    const queryRoomId = this.route.snapshot.queryParamMap.get('roomId');
    const targetRoomId = Number(paramRoomId || queryRoomId);

    this.servicesService.findAll().subscribe({
      next: (svcs) => {
        this.services = svcs || [];
      },
      error: () => {
        this.services = [];
      },
    });

    this.roomService.findAll().subscribe({
      next: (rooms) => {
        this.availableRooms = (rooms || []).filter(
          (r) => r.status === 'AVAILABLE',
        );
        if (targetRoomId) {
          const room = (rooms || []).find((r) => r.id === targetRoomId);
          if (room) {
            if (!this.availableRooms.some((r) => r.id === room.id)) {
              this.availableRooms.unshift(room);
            }
            this.selectedRoom = room;
            this.bookingForm.patchValue({ roomId: room.id });
          }
        } else if (this.availableRooms.length > 0) {
          this.selectedRoom = this.availableRooms[0];
          this.bookingForm.patchValue({ roomId: this.availableRooms[0].id });
        }
      },
      error: () => {
        this.availableRooms = [];
      },
    });

    this.bookingForm.get('roomId')?.valueChanges.subscribe((id) => {
      const numericId = Number(id);
      this.selectedRoom =
        this.availableRooms.find((r) => r.id === numericId) || null;
      if (this.selectedRoom) {
        const currentGuests =
          this.bookingForm.get('numberOfPeople')?.value || 1;
        if (currentGuests > this.selectedRoom.capacity) {
          this.bookingForm.patchValue({
            numberOfPeople: this.selectedRoom.capacity,
          });
        }
      }
    });
  }

  private initForm(): void {
    const today = new Date();
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const checkout = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);

    const todayStr = tomorrow.toISOString().split('T')[0];
    const checkoutStr = checkout.toISOString().split('T')[0];

    this.bookingForm = this.fb.group({
      roomId: [null, [Validators.required]],
      checkInDate: [todayStr, [Validators.required]],
      checkOutDate: [checkoutStr, [Validators.required]],
      numberOfPeople: [2, [Validators.required, Validators.min(1)]],
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
    const inDate = this.bookingForm?.get('checkInDate')?.value;
    const outDate = this.bookingForm?.get('checkOutDate')?.value;
    if (!inDate || !outDate) return 1;
    return this.reservationService.calculateNights(inDate, outDate);
  }

  get roomTotal(): number {
    if (!this.selectedRoom) return 0;
    return this.nightsCount * this.selectedRoom.pricePerNight;
  }

  get servicesTotal(): number {
    let sum = 0;
    this.selectedServiceIds.forEach((id) => {
      const svc = this.services.find((s) => s.id === id);
      if (svc?.price) sum += svc.price;
    });
    return sum;
  }

  get grandTotal(): number {
    return this.roomTotal + this.servicesTotal;
  }

  onSubmit(): void {
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      this.errorMessage =
        'Por favor complete todos los datos requeridos para la reserva.';
      return;
    }

    const val = this.bookingForm.value;
    if (new Date(val.checkOutDate) <= new Date(val.checkInDate)) {
      this.errorMessage =
        'La fecha de salida debe ser posterior a la fecha de llegada.';
      return;
    }

    if (
      this.selectedRoom &&
      Number(val.numberOfPeople) > this.selectedRoom.capacity
    ) {
      this.errorMessage = `La habitación seleccionada tiene una capacidad máxima de ${this.selectedRoom.capacity} huéspedes.`;
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    const serviceIds = Array.from(this.selectedServiceIds);

    this.reservationService
      .add({
        clientId: this.currentUser.id,
        roomId: Number(val.roomId),
        checkInDate: val.checkInDate,
        checkOutDate: val.checkOutDate,
        numberOfPeople: Number(val.numberOfPeople),
        serviceIds,
      })
      .subscribe({
        next: (res) => {
          this.successMessage = `¡Su reserva #${res.id} ha sido confirmada con éxito! Redirigiendo a su perfil...`;
          setTimeout(() => {
            this.router.navigate(['/profile']);
          }, 1500);
        },
        error: () => {
          this.isSubmitting = false;
          this.errorMessage =
            'Error al procesar la reserva. Por favor intente nuevamente.';
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
