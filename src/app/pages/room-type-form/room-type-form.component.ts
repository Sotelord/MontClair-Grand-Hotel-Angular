import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RoomTypeService } from '../../service/room-type.service';
import { RoomType } from '../../models/roomType.model';
import { RoomTypeFormHeaderComponent } from './components/room-type-form-header/room-type-form-header.component';
import { RoomTypeFieldsComponent } from './components/room-type-fields/room-type-fields.component';
import { RoomTypeFormActionsComponent } from './components/room-type-form-actions/room-type-form-actions.component';
import { ConfirmModalComponent } from '../../components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-room-type-form',
  imports: [
    ReactiveFormsModule,
    RoomTypeFormHeaderComponent,
    RoomTypeFieldsComponent,
    RoomTypeFormActionsComponent,
    ConfirmModalComponent,
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
    if (this.roomTypeForm.invalid) {
      this.roomTypeForm.markAllAsTouched();
      return;
    }

    const formValue = this.roomTypeForm.value;
    const roomType: RoomType = {
      id: this.currentRoomTypeId || 0,
      name: formValue.name,
      description: formValue.description,
      pricePerNight: Number(formValue.pricePerNight),
      imageUrl: formValue.imageUrl,
    };

    if (this.isEditMode && this.currentRoomTypeId) {
      this.roomTypeService.update(this.currentRoomTypeId, roomType).subscribe({
        next: () => this.router.navigate(['/admin/rooms-types']),
        error: () => {},
      });
    } else {
      this.roomTypeService.add(roomType).subscribe({
        next: () => this.router.navigate(['/admin/rooms-types']),
        error: () => {},
      });
    }
  }
}
