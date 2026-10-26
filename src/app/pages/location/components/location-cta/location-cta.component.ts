import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-location-cta',
  imports: [RouterLink],
  templateUrl: './location-cta.component.html',
  styleUrl: './location-cta.component.scss',
  standalone: true,
})
export class LocationCtaComponent {}
