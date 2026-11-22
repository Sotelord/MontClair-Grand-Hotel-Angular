import { Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-dates-step',
  imports: [ReactiveFormsModule],
  templateUrl: './dates-step.component.html',
  styleUrl: './dates-step.component.scss',
  standalone: true,
})
export class DatesStepComponent {
  form = input.required<FormGroup>();
  isEditMode = input.required<boolean>();
  todayDate = input.required<string>();
  minCheckOutDate = input.required<string>();
  nightsCount = input.required<number>();

  /** Número actual de huéspedes en el formulario */
  get guests(): number {
    return Number(this.form().get('numberOfPeople')?.value) || 1;
  }

  /** Suma o resta un huésped respetando el rango 1–10 del validador */
  changeGuests(delta: number): void {
    const control = this.form().get('numberOfPeople');
    if (!control) return;
    const next = Math.min(10, Math.max(1, this.guests + delta));
    control.setValue(next);
    control.markAsDirty();
  }
}
