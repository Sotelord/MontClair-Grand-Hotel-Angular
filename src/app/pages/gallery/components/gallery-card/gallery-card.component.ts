import { Component, input, output } from '@angular/core';
import { GalleryItem } from '../../../../models/gallery-item.model';

@Component({
  selector: 'app-gallery-card',
  imports: [],
  templateUrl: './gallery-card.component.html',
  styleUrl: './gallery-card.component.scss',
  standalone: true,
})
export class GalleryCardComponent {
  item = input.required<GalleryItem>();
  opened = output<GalleryItem>();
}
