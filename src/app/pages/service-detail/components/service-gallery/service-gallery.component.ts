import { Component, input } from '@angular/core';
import { OrnamentDividerComponent } from '../../../../components/ornament-divider/ornament-divider.component';

@Component({
  selector: 'app-service-gallery',
  imports: [OrnamentDividerComponent],
  templateUrl: './service-gallery.component.html',
  styleUrl: './service-gallery.component.scss',
  standalone: true,
})
export class ServiceGalleryComponent {
  images = input.required<string[]>();
}
