import { Component, input } from '@angular/core';
import { Service } from '../../../../models/service.model';

@Component({
  selector: 'app-service-card',
  imports: [],
  templateUrl: './service-card.component.html',
  styleUrl: './service-card.component.scss',
})
export class ServiceCardComponent {
  service = input.required<Service>();
}
