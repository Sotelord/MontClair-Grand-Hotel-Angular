import { Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-room-type-fields',
  imports: [ReactiveFormsModule],
  templateUrl: './room-type-fields.component.html',
  styleUrl: './room-type-fields.component.scss',
  standalone: true,
})
export class RoomTypeFieldsComponent {
  form = input.required<FormGroup>();

  showError(name: string): boolean {
    const control = this.form().get(name);
    return !!(control?.touched && control.invalid);
  }
}
