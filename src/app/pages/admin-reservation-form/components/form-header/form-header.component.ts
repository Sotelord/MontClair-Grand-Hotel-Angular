import { Component, input } from '@angular/core';

@Component({
  selector: 'app-form-header',
  imports: [],
  templateUrl: './form-header.component.html',
  styleUrl: './form-header.component.scss',
  standalone: true,
})
export class FormHeaderComponent {
  isEditMode = input.required<boolean>();
}
