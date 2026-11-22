import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RoomTypeService } from '../../service/room-type.service';
import { RoomType } from '../../models/roomType.model';
import { RoomTypeFormHeaderComponent } from './components/room-type-form-header/room-type-form-header.component';
import { RoomTypeFieldsComponent } from './components/room-type-fields/room-type-fields.component';
import { RoomTypeFormActionsComponent } from './components/room-type-form-actions/room-type-form-actions.component';
import { ErrorAlertComponent } from '../../components/error-alert/error-alert.component';

@Component({
  selector: 'app-room-type-form',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    RoomTypeFormHeaderComponent,
    RoomTypeFieldsComponent,
    RoomTypeFormActionsComponent,
    ErrorAlertComponent,
  ],
  templateUrl: './room-type-form.component.html',
  styleUrl: './room-type-form.component.scss',
})
export class RoomTypeFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private roomTypeService = inject(RoomTypeService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  roomTypeForm: FormGroup;
  isEditMode: boolean = false;
  currentRoomTypeId?: number;

  errorMessage: string | null = null;
  isSubmitting = false;

  constructor() {
    this.roomTypeForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      pricePerNight: [0, [Validators.required, Validators.min(1)]],
      imageUrl: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.currentRoomTypeId = Number(idParam);
      this.roomTypeService.findById(this.currentRoomTypeId).subscribe({
        next: (roomType) => {
          if (roomType) {
            this.roomTypeForm.patchValue(roomType);
          } else {
            this.router.navigate(['/admin/rooms-types']);
          }
        },
        error: () => {
          this.router.navigate(['/admin/rooms-types']);
        },
      });
    }
  }

  handleSubmit(): void {
    this.errorMessage = null;

    if (this.roomTypeForm.invalid) {
      this.roomTypeForm.markAllAsTouched();
      this.errorMessage =
        'Por favor completa correctamente los campos marcados.';
      return;
    }

    if (this.isSubmitting) {
      return;
    }

    const formValue = this.roomTypeForm.value;
    const roomType: RoomType = {
      id: this.currentRoomTypeId || 0,
      name: formValue.name.trim(),
      description: formValue.description.trim(),
      pricePerNight: Number(formValue.pricePerNight),
      imageUrl: formValue.imageUrl.trim(),
    };

    this.isSubmitting = true;

    const request$ =
      this.isEditMode && this.currentRoomTypeId
        ? this.roomTypeService.update(this.currentRoomTypeId, roomType)
        : this.roomTypeService.add(roomType);

    request$.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/admin/rooms-types']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage =
          err?.error?.message ||
          (this.isEditMode
            ? 'No se pudo actualizar la categoría. Intenta nuevamente.'
            : 'No se pudo guardar la categoría. Verifica que el nombre no exista ya.');
      },
    });
  }
}
