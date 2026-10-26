import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-success-alert',
  imports: [],
  templateUrl: './success-alert.component.html',
  styleUrl: './success-alert.component.scss',
  standalone: true,
})
export class SuccessAlertComponent {
  message = input.required<string>();
  dismissible = input(false);
  closed = output<void>();
}
