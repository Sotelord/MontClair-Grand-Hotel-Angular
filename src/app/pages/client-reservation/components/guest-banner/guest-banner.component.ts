import { Component, input } from '@angular/core';
import { Client } from '../../../../models/client.model';

@Component({
  selector: 'app-guest-banner',
  imports: [],
  templateUrl: './guest-banner.component.html',
  styleUrl: './guest-banner.component.scss',
  standalone: true,
})
export class GuestBannerComponent {
  client = input.required<Client>();
  isEditMode = input.required<boolean>();
  reservationId = input<number | undefined>();

  readonly defaultAvatar =
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';
}
