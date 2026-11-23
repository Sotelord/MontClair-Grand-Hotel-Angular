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

  get imageUrl(): string {
    return (this.form().get('imageUrl')?.value || '').trim();
  }

  getFieldError(form: FormGroup, fieldName: string): string | null {
    const control = form.get(fieldName);
    if (!control || !control.touched || !control.errors) {
      return null;
    }
    if (control.errors['required']) {
      return 'La imagen es obligatoria: se usa en la tarjeta del servicio.';
    }
    return 'Valor no válido.';
  }

  error(name: string): string | null {
    return this.getFieldError(this.form(), name);
  }
}
