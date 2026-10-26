import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile-breadcrumb',
  imports: [RouterLink],
  templateUrl: './profile-breadcrumb.component.html',
  styleUrl: './profile-breadcrumb.component.scss',
  standalone: true,
})
export class ProfileBreadcrumbComponent {
  clientId = input.required<number>();
}
