import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-danger-zone',
  imports: [],
  templateUrl: './danger-zone.component.html',
  styleUrl: './danger-zone.component.scss',
  standalone: true,
})
export class DangerZoneComponent {
  isDeleting = input.required<boolean>();
  deleteRequested = output<void>();
}
