import { Component, input } from '@angular/core';
import { Highlight } from '../../../../models/highlight.model';

@Component({
  selector: 'app-service-highlights',
  imports: [],
  templateUrl: './service-highlights.component.html',
  styleUrl: './service-highlights.component.scss',
  standalone: true,
})
export class ServiceHighlightsComponent {
  highlights = input.required<Highlight[]>();
}
