import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Service } from '../../../../models/service.model';

@Component({
  selector: 'app-service-card',
  imports: [RouterLink],
  templateUrl: './service-card.component.html',
  styleUrl: './service-card.component.scss',
  standalone: true,
})
export class ServiceCardComponent {
  service = input.required<Service>();
}
