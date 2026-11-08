import { Component, input } from '@angular/core';

@Component({
  selector: 'app-info-card',
  imports: [],
  templateUrl: './info-card.component.html',
  styleUrl: './info-card.component.scss',
  standalone: true,
})
export class InfoCardComponent {
  label = input.required<string>();
  title = input.required<string>();
}
