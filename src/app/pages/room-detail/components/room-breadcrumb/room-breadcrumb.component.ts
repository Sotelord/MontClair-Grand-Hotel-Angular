import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-room-breadcrumb',
  imports: [RouterLink],
  templateUrl: './room-breadcrumb.component.html',
  styleUrl: './room-breadcrumb.component.scss',
  standalone: true,
})
export class RoomBreadcrumbComponent {
  roomName = input.required<string | undefined>();
}
