import { Component, input } from '@angular/core';

@Component({
  selector: 'app-stay-dates-card',
  imports: [],
  templateUrl: './stay-dates-card.component.html',
  styleUrl: './stay-dates-card.component.scss',
  standalone: true,
})
export class StayDatesCardComponent {
  checkInDate = input.required<string>();
  checkOutDate = input.required<string>();
  nightsCount = input.required<number>();
}
