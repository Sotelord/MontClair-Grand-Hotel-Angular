import { Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-specs-fields',
  imports: [ReactiveFormsModule],
  templateUrl: './specs-fields.component.html',
  styleUrl: './specs-fields.component.scss',
  standalone: true,
})
export class SpecsFieldsComponent {
  form = input.required<FormGroup>();
}
