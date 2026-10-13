import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RoomService } from '../../service/room.service';
import { RoomTypeService } from '../../service/room-type.service';
import { RoomType } from '../../models/roomType.model';
import { Room } from '../../models/room.model';

@Component({
  selector: 'app-room-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './room-form.component.html',
  styleUrl: './room-form.component.scss',
})
export class RoomFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private roomService = inject(RoomService);
  private roomTypeService = inject(RoomTypeService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  roomForm!: FormGroup;
  isEditMode: boolean = false;
  roomId?: number;
  roomTypes: RoomType[] = [];
  errorMessage: string | null = null;
  private currentRoom?: Room;

  ngOnInit(): void {
    this.initForm();

    this.roomTypeService.findAll().subscribe({
      next: (types) => {
        this.roomTypes = types || [];
        if (this.roomTypes.length > 0 && !this.isEditMode) {
          this.roomForm.patchValue({
            typeId: this.roomTypes[0].id,
            pricePerNight: this.roomTypes[0].pricePerNight,
            name: this.roomTypes[0].name,
          });
        }
      },
      error: () => {
        this.roomTypes = [];
      },
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.roomId = Number(idParam);
      this.roomService.findById(this.roomId).subscribe({
        next: (existing) => {
          if (existing) {
            this.currentRoom = existing;
            this.roomForm.patchValue({
              name: existing.name,
              number: existing.number,
              typeId: existing.roomType?.id || (existing as any).typeId,
              floor: existing.floor,
              status: existing.status,
              pricePerNight: existing.pricePerNight,
              capacity: existing.capacity,
              bedType: existing.bedType || 'King Size',
              area: existing.area || 30,
              secondaryImageUrl: existing.secondaryImageUrl || '',
              heroDescription: existing.heroDescription || '',
            });
          } else {
            this.router.navigate(['/admin/rooms']);
          }
        },
        error: () => {
          this.router.navigate(['/admin/rooms']);
        },
      });
    }
  }

  private initForm(): void {
    this.roomForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      number: [
        '',
        [Validators.required, Validators.pattern(/^[0-9A-Za-z-]+$/)],
      ],
      typeId: [this.roomTypes[0]?.id || 1, [Validators.required]],
      floor: [1, [Validators.required, Validators.min(1)]],
      status: ['AVAILABLE', [Validators.required]],
      pricePerNight: [100.0, [Validators.required, Validators.min(1)]],
      capacity: [2, [Validators.required, Validators.min(1)]],
      bedType: ['King Size', [Validators.required]],
      area: [30, [Validators.required, Validators.min(10)]],
      secondaryImageUrl: [''],
      heroDescription: [''],
    });

    this.roomForm.get('typeId')?.valueChanges.subscribe((typeId) => {
      if (!this.isEditMode) {
        const selectedType = this.roomTypes.find(
          (t) => t.id === Number(typeId),
        );
        if (selectedType) {
          if (
            !this.roomForm.get('name')?.value ||
            this.roomTypes.some(
              (t) => t.name === this.roomForm.get('name')?.value,
            )
          ) {
            this.roomForm.patchValue({ name: selectedType.name });
          }
          this.roomForm.patchValue({
            pricePerNight: selectedType.pricePerNight,
          });
        }
      }
    });
  }

  onSubmit(): void {
    if (this.roomForm.invalid) {
      this.roomForm.markAllAsTouched();
      this.errorMessage =
        'Por favor, completa correctamente todos los campos obligatorios.';
      return;
    }

    const val = this.roomForm.value;
    // Usamos la lista que el componente ya cargó, no la caché del servicio
    const selectedType = this.roomTypes.find(
      (t) => t.id === Number(val.typeId),
    );

    if (!selectedType) {
      this.errorMessage = 'Por favor selecciona una categoría válida.';
      return;
    }
    const { type, imageUrl, description, priceLabel, typeId, ...base } = (this
      .currentRoom ?? {}) as any;

    const roomData: Omit<Room, 'id'> & { id?: number } = {
      highlights: [],
      galleryImages: [],
      ...base,
      name: val.name,
      number: val.number.trim(),
      roomType: selectedType,
      floor: Number(val.floor),
      status: val.status,
      pricePerNight: Number(val.pricePerNight),
      capacity: Number(val.capacity),
      bedType: val.bedType,
      area: Number(val.area),
      secondaryImageUrl: val.secondaryImageUrl?.trim() || selectedType.imageUrl,
      heroDescription: val.heroDescription || selectedType.description,
    };

    this.errorMessage = null;

    if (this.isEditMode && this.roomId) {
      this.roomService
        .update(this.roomId, { ...roomData, id: this.roomId } as Room)
        .subscribe({
          next: () => this.router.navigate(['/admin/rooms']),
          error: (err) =>
            (this.errorMessage =
              err.error?.mensaje ??
              'Error al actualizar la habitación en el servidor.'),
        });
    } else {
      this.roomService.add(roomData as any).subscribe({
        next: () => this.router.navigate(['/admin/rooms']),
        error: (err) =>
          (this.errorMessage =
            err.error?.mensaje ?? 'Error al registrar la habitación.'),
      });
    }
  }
  isFieldInvalid(fieldName: string): boolean {
    const field = this.roomForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
