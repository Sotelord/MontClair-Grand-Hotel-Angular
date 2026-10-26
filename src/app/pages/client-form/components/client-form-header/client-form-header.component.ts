import { Component, input } from '@angular/core';

@Component({
  selector: 'app-client-form-header',
  imports: [],
  templateUrl: './client-form-header.component.html',
  styleUrl: './client-form-header.component.scss',
  standalone: true,
})
export class ClientFormHeaderComponent {
  isEditMode = input.required<boolean>();
}
