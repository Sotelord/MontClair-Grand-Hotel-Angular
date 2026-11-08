import { Component, input } from '@angular/core';
import { PointOfInterest } from '../../../../models/location.model';

@Component({
  selector: 'app-poi-card',
  imports: [],
  templateUrl: './poi-card.component.html',
  styleUrl: './poi-card.component.scss',
  standalone: true,
})
export class PoiCardComponent {
  poi = input.required<PointOfInterest>();
}
