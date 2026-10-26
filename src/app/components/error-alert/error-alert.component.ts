import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-error-alert',
  imports: [],
  templateUrl: './error-alert.component.html',
  styleUrl: './error-alert.component.scss',
  standalone: true,
})
export class ErrorAlertComponent {
  message = input.required<string>();
  closed = output<void>();
}
