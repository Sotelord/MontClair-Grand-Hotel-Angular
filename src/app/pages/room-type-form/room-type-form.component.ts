import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RoomTypeService } from '../../service/room-type.service';
import { RoomType } from '../../models/roomType.model';

@Component({
  selector: 'app-room-type-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './room-type-form.component.html',
  styleUrl: './room-type-form.component.scss'
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
      imageUrl: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.currentRoomTypeId = Number(idParam);
      const roomType = this.roomTypeService.getRoomTypeById(this.currentRoomTypeId);
      
      if (roomType) {
        this.roomTypeForm.patchValue(roomType);
      } else {
        this.router.navigate(['/admin/rooms-types']);
      }
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
      imageUrl: formValue.imageUrl
    };

    if (this.isEditMode) {
      this.roomTypeService.updateRoomType(roomType);
    } else {
      this.roomTypeService.addRoomType(roomType);
    }

    this.router.navigate(['/admin/rooms-types']);
  }
}
