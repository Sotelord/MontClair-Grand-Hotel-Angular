import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  imports: [],
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.scss',
  standalone: true,
})
export class ConfirmModalComponent {
  title = input.required<string>();
  confirmLabel = input('Eliminar');
  confirmed = output<void>();
  cancelled = output<void>();
}
