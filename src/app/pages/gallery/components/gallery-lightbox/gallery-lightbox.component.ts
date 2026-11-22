import {
  Component,
  HostListener,
  input,
  OnDestroy,
  OnInit,
  output,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { GalleryItem } from '../../../../models/gallery-item.model';

@Component({
  selector: 'app-gallery-lightbox',
  imports: [RouterLink],
  templateUrl: './gallery-lightbox.component.html',
  styleUrl: './gallery-lightbox.component.scss',
  standalone: true,
})
export class GalleryLightboxComponent implements OnInit, OnDestroy {
  item = input.required<GalleryItem>();
  closed = output<void>();

  ngOnInit(): void {
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    document.body.style.overflow = '';
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closed.emit();
  }
}
