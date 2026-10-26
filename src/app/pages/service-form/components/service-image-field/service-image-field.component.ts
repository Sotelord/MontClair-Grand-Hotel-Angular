import { Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-service-image-field',
  imports: [ReactiveFormsModule],
  templateUrl: './service-image-field.component.html',
  styleUrl: './service-image-field.component.scss',
  standalone: true,
})
export class ServiceImageFieldComponent {
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
