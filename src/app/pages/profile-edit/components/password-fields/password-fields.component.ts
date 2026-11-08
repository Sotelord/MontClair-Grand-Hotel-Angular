import { Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-password-fields',
  imports: [ReactiveFormsModule],
  templateUrl: './password-fields.component.html',
  styleUrl: './password-fields.component.scss',
  standalone: true,
})
export class PasswordFieldsComponent {
  form = input.required<FormGroup>();
}
