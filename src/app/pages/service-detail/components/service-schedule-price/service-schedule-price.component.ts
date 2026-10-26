import { Component, input } from '@angular/core';
import { Service } from '../../../../models/service.model';

@Component({
  selector: 'app-service-schedule-price',
  imports: [],
  templateUrl: './service-schedule-price.component.html',
  styleUrl: './service-schedule-price.component.scss',
  standalone: true,
})
export class ServiceSchedulePriceComponent {
  service = input.required<Service>();
}
