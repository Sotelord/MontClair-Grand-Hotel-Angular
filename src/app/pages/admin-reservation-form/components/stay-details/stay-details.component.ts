import { Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-stay-details',
  imports: [ReactiveFormsModule],
  templateUrl: './stay-details.component.html',
  styleUrl: './stay-details.component.scss',
  standalone: true,
})
export class StayDetailsComponent {
  form = input.required<FormGroup>();
  isEditMode = input.required<boolean>();
  todayDate = input.required<string>();
  minCheckOutDate = input.required<string>();
}
