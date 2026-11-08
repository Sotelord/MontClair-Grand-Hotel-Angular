import { Component, input } from '@angular/core';

@Component({
  selector: 'app-login-alert',
  imports: [],
  templateUrl: './login-alert.component.html',
  styleUrl: './login-alert.component.scss',
  standalone: true,
})
export class LoginAlertComponent {
  variant = input.required<'success' | 'error'>();
  title = input.required<string>();
  message = input.required<string>();
}
