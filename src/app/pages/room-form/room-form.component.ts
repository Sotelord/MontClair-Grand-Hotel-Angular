import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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

  ngOnInit(): void {
    this.roomTypes = this.roomTypeService.getRoomTypes();
    this.initForm();

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.roomId = Number(idParam);
      const existing = this.roomService.getRoomById(this.roomId);
      if (existing) {
        this.roomForm.patchValue({
          name: existing.name,
          number: existing.number,
          typeId: existing.roomType?.id || (this.roomTypes[0]?.id ?? 1),
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
    }
  }

  private initForm(): void {
    this.roomForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      number: ['', [Validators.required, Validators.pattern(/^[0-9A-Za-z-]+$/)]],
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

    // Auto-update price when room type changes if adding
    this.roomForm.get('typeId')?.valueChanges.subscribe((typeId) => {
      if (!this.isEditMode) {
        const selectedType = this.roomTypes.find((t) => t.id === Number(typeId));
        if (selectedType) {
          if (!this.roomForm.get('name')?.value || this.roomTypes.some(t => t.name === this.roomForm.get('name')?.value)) {
            this.roomForm.patchValue({ name: selectedType.name });
          }
          this.roomForm.patchValue({ pricePerNight: selectedType.pricePerNight });
        }
      }
    });
  }

  onSubmit(): void {
    if (this.roomForm.invalid) {
      this.roomForm.markAllAsTouched();
      this.errorMessage = 'Por favor, completa correctamente todos los campos obligatorios.';
      return;
    }

    const val = this.roomForm.value;
    const selectedType = this.roomTypeService.getRoomTypeById(Number(val.typeId));

    if (!selectedType) {
      this.errorMessage = 'Por favor selecciona una categoría válida.';
      return;
    }

    const roomData: Omit<Room, 'id'> & { id?: number } = {
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
      highlights: [],
      galleryImages: [],
    };

    if (this.isEditMode && this.roomId) {
      const result = this.roomService.updateRoom({
        ...roomData,
        id: this.roomId,
      });

      if (result.success) {
        this.router.navigate(['/admin/rooms']);
      } else {
        this.errorMessage = result.message || 'Error al actualizar la habitación.';
      }
    } else {
      const result = this.roomService.addRoom(roomData as Room);
      if (result.success) {
        this.router.navigate(['/admin/rooms']);
      } else {
        this.errorMessage = result.message || 'Error al registrar la habitación.';
      }
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.roomForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
