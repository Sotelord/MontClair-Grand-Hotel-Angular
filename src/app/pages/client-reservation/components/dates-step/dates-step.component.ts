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
}
