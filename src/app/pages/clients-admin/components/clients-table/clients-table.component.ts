import { Component, input, output } from '@angular/core';
import { RoleBadgeComponent } from '../role-badge/role-badge.component';
import { Client } from '../../../../models/client.model';

@Component({
  selector: 'app-clients-table',
  imports: [RoleBadgeComponent],
  templateUrl: './clients-table.component.html',
  styleUrl: './clients-table.component.scss',
  standalone: true,
})
export class ClientsTableComponent {
  clients = input.required<Client[]>();
  editRequested = output<number>();
  deleteRequested = output<Client>();

  readonly defaultAvatar =
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';

  formatId(id: number): string {
    return '#' + String(id).padStart(3, '0');
  }
}
