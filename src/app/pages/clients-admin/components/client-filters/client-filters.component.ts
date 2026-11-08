import { Component, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-client-filters',
  imports: [FormsModule],
  templateUrl: './client-filters.component.html',
  styleUrl: './client-filters.component.scss',
  standalone: true,
})
export class ClientFiltersComponent {
  selectedRole = model<string>('ALL');
  total = input.required<number>();
}
