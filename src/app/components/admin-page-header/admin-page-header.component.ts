import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-admin-page-header',
  imports: [],
  templateUrl: './admin-page-header.component.html',
  styleUrl: './admin-page-header.component.scss',
})
export class AdminPageHeaderComponent {
  superiorText = input.required<string>();
  title = input.required<string>();
  description = input.required<string>();

  buttonText = input<string>();

  buttonClick = output<void>();

  onButtonClick(): void {
    this.buttonClick.emit();
  }
}
