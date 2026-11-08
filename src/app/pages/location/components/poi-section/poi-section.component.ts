import { Component, input } from '@angular/core';
import { PoiCardComponent } from '../poi-card/poi-card.component';
import { PointOfInterest } from '../../../../models/location.model';

@Component({
  selector: 'app-poi-section',
  imports: [PoiCardComponent],
  templateUrl: './poi-section.component.html',
  styleUrl: './poi-section.component.scss',
  standalone: true,
})
export class PoiSectionComponent {
  points = input.required<PointOfInterest[]>();
}
