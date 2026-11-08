import { Component, input } from '@angular/core';

@Component({
  selector: 'app-service-form-banner',
  imports: [],
  templateUrl: './service-form-banner.component.html',
  styleUrl: './service-form-banner.component.scss',
  standalone: true,
})
export class ServiceFormBannerComponent {
  isEditMode = input.required<boolean>();
}
