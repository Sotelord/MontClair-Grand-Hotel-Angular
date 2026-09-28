import { Component, input } from '@angular/core';
import { Service } from '../../../../models/service.model';
import { ServiceCardComponent } from '../service-card/service-card.component';

@Component({
  selector: 'app-services-section',
  imports: [ServiceCardComponent],
  templateUrl: './services-section.component.html',
  styleUrl: './services-section.component.scss',
})
export class ServicesSectionComponent {
  serviceArray = input.required<Service[]>();
}
