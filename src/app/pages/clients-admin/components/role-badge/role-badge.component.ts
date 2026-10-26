import { Component, input } from '@angular/core';

@Component({
  selector: 'app-role-badge',
  imports: [],
  templateUrl: './role-badge.component.html',
  styleUrl: './role-badge.component.scss',
  standalone: true,
})
export class RoleBadgeComponent {
  role = input<string | undefined>();
}
