import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-service-form-actions',
  imports: [RouterLink],
  templateUrl: './service-form-actions.component.html',
  styleUrl: './service-form-actions.component.scss',
  standalone: true,
})
export class ServiceFormActionsComponent {}
