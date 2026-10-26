import { Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-account-fields',
  imports: [ReactiveFormsModule],
  templateUrl: './account-fields.component.html',
  styleUrl: './account-fields.component.scss',
  standalone: true,
})
export class AccountFieldsComponent {
  form = input.required<FormGroup>();

  isFieldInvalid(form: FormGroup, fieldName: string): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  isInvalid(name: string): boolean {
    return this.isFieldInvalid(this.form(), name);
  }
}
