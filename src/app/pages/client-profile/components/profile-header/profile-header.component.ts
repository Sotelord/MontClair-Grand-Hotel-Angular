import { Component, input, output } from '@angular/core';
import { Client } from '../../../../models/client.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile-header',
  imports: [RouterLink],
  templateUrl: './profile-header.component.html',
  styleUrl: './profile-header.component.scss',
  standalone: true,
})
export class ProfileHeaderComponent {
  client = input.required<Client>();
  logoutClicked = output<void>();

  readonly defaultAvatar =
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
}
