import { Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile-fields',
  imports: [ReactiveFormsModule],
  templateUrl: './profile-fields.component.html',
  styleUrl: './profile-fields.component.scss',
  standalone: true,
})
export class ProfileFieldsComponent {
  form = input.required<FormGroup>();
  isAdminView = input.required<boolean>();
}
