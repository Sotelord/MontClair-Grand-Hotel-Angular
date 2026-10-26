import { Component } from '@angular/core';

@Component({
  selector: 'app-booking-benefits',
  imports: [],
  templateUrl: './booking-benefits.component.html',
  styleUrl: './booking-benefits.component.scss',
  standalone: true,
})
export class BookingBenefitsComponent {
  benefits = [
    'Confirmación instantánea',
    'Cancelación gratuita hasta 48h antes',
    'Atención VIP por conserjería',
  ];
}
