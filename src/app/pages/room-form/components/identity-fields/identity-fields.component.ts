import { Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-identity-fields',
  imports: [ReactiveFormsModule],
  templateUrl: './identity-fields.component.html',
  styleUrl: './identity-fields.component.scss',
  standalone: true,
})
export class IdentityFieldsComponent {
  form = input.required<FormGroup>();

  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isInvalid(name: string): boolean {
    return this.isFieldInvalid(this.form(), name);
  }
}
