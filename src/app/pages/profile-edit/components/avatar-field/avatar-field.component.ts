import { Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-avatar-field',
  imports: [ReactiveFormsModule],
  templateUrl: './avatar-field.component.html',
  styleUrl: './avatar-field.component.scss',
  standalone: true,
})
export class AvatarFieldComponent {
  form = input.required<FormGroup>();
}
