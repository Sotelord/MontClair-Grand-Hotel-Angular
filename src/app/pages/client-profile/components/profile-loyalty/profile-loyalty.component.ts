import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Client } from '../../../../models/client.model';

interface LoyaltyTier {
  name: string;
  nightsRequired: number;
  subtitle: string;
  benefits: string[];
}

@Component({
  selector: 'app-profile-loyalty',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-loyalty.component.html',
  styleUrl: './profile-loyalty.component.scss',
})
export class ProfileLoyaltyComponent {
  client = input.required<Client>();
  validNights = input<number>(0);

  readonly tiers: LoyaltyTier[] = [
    {
      name: 'Classic',
      nightsRequired: 0,
      subtitle: 'Nivel inicial al registrarse',
      benefits: [
        'Tarifa preferencial directa en reservas web',
        'Wi-Fi de alta velocidad de cortesía',
        'Check-in prioritario en recepción',
      ],
    },
    {
      name: 'Privilège',
      nightsRequired: 5,
      subtitle: 'A partir de 5 noches válidas',
      benefits: [
        'Late Check-out hasta las 14:00 (sujeto a disponibilidad)',
        'Bebida de bienvenida artesanal',
        '10% de cortesía en servicios de Spa & Restaurante',
      ],
    },
    {
      name: 'Imperial',
      nightsRequired: 20,
      subtitle: 'A partir de 20 noches válidas',
      benefits: [
        'Ascenso de categoría de Suite según disponibilidad',
        'Acceso exclusivo a MontClair Lounge & Concierge 24/7',
        'Desayuno gourmet incluido para dos huéspedes',
      ],
    },
  ];

  estimatedPoints = computed(() => this.validNights() * 500);
}

