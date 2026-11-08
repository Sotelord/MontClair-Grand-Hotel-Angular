import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GalleryItem } from '../../../../models/gallery-item.model';

@Component({
  selector: 'app-gallery-lightbox',
  imports: [RouterLink],
  templateUrl: './gallery-lightbox.component.html',
  styleUrl: './gallery-lightbox.component.scss',
  standalone: true,
})
export class GalleryLightboxComponent {
  item = input.required<GalleryItem>();
  closed = output<void>();
}
