import { Component, input } from '@angular/core';
import { Client } from '../../../../models/client.model';

@Component({
  selector: 'app-profile-stats',
  imports: [],
  templateUrl: './profile-stats.component.html',
  styleUrl: './profile-stats.component.scss',
  standalone: true,
})
export class ProfileStatsComponent {
  client = input.required<Client>();
  reservationsCount = input.required<number>();
}
