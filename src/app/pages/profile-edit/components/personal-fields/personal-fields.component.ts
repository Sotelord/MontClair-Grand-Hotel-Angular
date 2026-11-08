import { Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-personal-fields',
  imports: [ReactiveFormsModule],
  templateUrl: './personal-fields.component.html',
  styleUrl: './personal-fields.component.scss',
  standalone: true,
})
export class PersonalFieldsComponent {
  form = input.required<FormGroup>();

  showError(name: string): boolean {
    const control = this.form().get(name);
    return !!(control?.touched && control.invalid);
  }
}
