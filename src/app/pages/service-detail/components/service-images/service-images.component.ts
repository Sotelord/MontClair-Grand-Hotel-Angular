import { Component, input } from '@angular/core';
import { Service } from '../../../../models/service.model';

@Component({
  selector: 'app-service-images',
  imports: [],
  templateUrl: './service-images.component.html',
  styleUrl: './service-images.component.scss',
  standalone: true,
})
export class ServiceImagesComponent {
  service = input.required<Service>();
}
