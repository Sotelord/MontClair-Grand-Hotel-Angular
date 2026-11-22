import { Component, computed, input } from '@angular/core';

interface DateParts {
  day: string;
  monthYear: string;
  weekday: string;
}

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

  checkIn = computed(() => this.toParts(this.checkInDate()));
  checkOut = computed(() => this.toParts(this.checkOutDate()));

  private toParts(value: string): DateParts {
    const [y, m, d] = (value || '').split('-').map(Number);
    if (!y || !m || !d) {
      return { day: '—', monthYear: value || '', weekday: '' };
    }
    const date = new Date(y, m - 1, d);
    const month = new Intl.DateTimeFormat('es-ES', { month: 'short' })
      .format(date)
      .replace('.', '');
    const weekday = new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
    }).format(date);
    return { day: String(d), monthYear: `${month} ${y}`, weekday };
  }
}
