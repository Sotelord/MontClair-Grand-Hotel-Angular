import { NgClass } from '@angular/common';
import { Component, input, output } from '@angular/core';

export interface GalleryCategory {
  id: string;
  label: string;
}

@Component({
  selector: 'app-category-filter',
  imports: [NgClass],
  templateUrl: './category-filter.component.html',
  styleUrl: './category-filter.component.scss',
  standalone: true,
})
export class CategoryFilterComponent {
  categories = input.required<GalleryCategory[]>();
  selectedId = input.required<string>();
  categorySelected = output<string>();
}
