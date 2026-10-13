import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-location',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './location.component.html',
  styleUrl: './location.component.scss',
})
export class LocationComponent {
  pointsOfInterest = [
    {
      name: 'Casino de Monte-Carlo',
      category: 'Ocio & Cultura',
      distance: '300 metros',
      time: '4 min a pie',
      description: 'El legendario complejo de juego y ópera más icónico de la Riviera Francesa.',
    },
    {
      name: 'Puerto Hércules',
      category: 'Marina de Yates',
      distance: '600 metros',
      time: '8 min a pie',
      description: 'El puerto principal del principado, epicentro del Gran Premio de F1 y yates de lujo.',
    },
    {
      name: 'Playa de Larvotto',
      category: 'Costa & Mar',
      distance: '1.2 km',
      time: '15 min a pie / 4 min en coche',
      description: 'Playa pública y privada de arena fina con paseo marítimo y clubes de playa exclusivos.',
    },
    {
      name: 'Palacio del Príncipe de Mónaco',
      category: 'Historia',
      distance: '1.8 km',
      time: '7 min en coche privado',
      description: 'Residencia oficial de los príncipes de Mónaco en lo alto de la mítica Roca.',
    },
  ];

  transferServices = [
    {
      title: 'Aeropuerto Internacional Niza Costa Azul (NCE)',
      duration: '30 min coche / 7 min helicóptero',
      details: 'Traslado privado en Mercedes Clase S o helicóptero directo al helipuerto de Fontvieille.',
    },
    {
      title: 'Estación de Tren Monte-Carlo (SNCF)',
      duration: '5 min en coche / 10 min a pie',
      details: 'Servicio de recogida en andén por nuestro conserje con transporte de equipaje prioritario.',
    },
    {
      title: 'Valet Parking & Carga Eléctrica 24h',
      duration: 'Inmediato en puerta principal',
      details: 'Aparcamiento subterráneo vigilado con estaciones de carga rápida Tesla y universales.',
    },
  ];
}
