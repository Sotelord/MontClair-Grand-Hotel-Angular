import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  imports: [],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss',
})
export class PageHeaderComponent {
  superiorText = input<string>();
  title = input.required<string>();
  description = input<string>();
  backgroundImage = input<string>();
}
