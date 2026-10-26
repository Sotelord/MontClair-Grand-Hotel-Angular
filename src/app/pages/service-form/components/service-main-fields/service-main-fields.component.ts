import { Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-service-main-fields',
  imports: [ReactiveFormsModule],
  templateUrl: './service-main-fields.component.html',
  styleUrl: './service-main-fields.component.scss',
})
export class ServiceMainFieldsComponent {
  form = input.required<FormGroup>();

  getFieldError(form: FormGroup, fieldName: string): string | null {
    const control = form.get(fieldName);
    if (!control || !control.touched || !control.errors) {
      return null;
    }
    if (control.errors['required']) {
      return 'Este campo es obligatorio.';
    }
    if (control.errors['minlength']) {
      return `Debe tener al menos ${control.errors['minlength'].requiredLength} caracteres.`;
    }
    if (control.errors['min']) {
      return `El valor mínimo es ${control.errors['min'].min}.`;
    }
    return 'Valor no válido.';
  }

  error(name: string): string | null {
    return this.getFieldError(this.form(), name);
  }
}
