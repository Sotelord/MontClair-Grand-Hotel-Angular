import { Component, input } from '@angular/core';
import { Highlight } from '../../../../models/highlight.model';

@Component({
  selector: 'app-room-highlights',
  imports: [],
  templateUrl: './room-highlights.component.html',
  styleUrl: './room-highlights.component.scss',
  standalone: true,
})
export class RoomHighlightsComponent {
  highlights = input.required<Highlight[]>();
}
