import { Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-media-fields',
  imports: [ReactiveFormsModule],
  templateUrl: './media-fields.component.html',
  styleUrl: './media-fields.component.scss',
  standalone: true,
})
export class MediaFieldsComponent {
  form = input.required<FormGroup>();
}
