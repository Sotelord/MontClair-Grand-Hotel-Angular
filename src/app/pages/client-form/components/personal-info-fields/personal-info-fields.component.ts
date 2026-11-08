import { Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-personal-info-fields',
  imports: [ReactiveFormsModule],
  templateUrl: './personal-info-fields.component.html',
  styleUrl: './personal-info-fields.component.scss',
  standalone: true,
})
export class PersonalInfoFieldsComponent {
  form = input.required<FormGroup>();

  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isInvalid(name: string): boolean {
    return this.isFieldInvalid(this.form(), name);
  }
}
