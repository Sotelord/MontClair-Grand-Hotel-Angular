import { Component, computed, input, output } from '@angular/core';
import { Client } from '../../../../models/client.model';

@Component({
  selector: 'app-profile-details',
  standalone: true,
  imports: [],
  templateUrl: './profile-details.component.html',
  styleUrl: './profile-details.component.scss',
})
export class ProfileDetailsComponent {
  client = input.required<Client>();
  editRequested = output<void>();

  readonly defaultAvatar =
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';

  memberCode = computed(() => {
    const id = this.client().id ?? 0;
    return `MC-${String(id).padStart(6, '0')}`;
  });

  roleDisplay = computed(() => {
    const role = this.client().role?.toUpperCase();
    if (role === 'ADMIN') return 'Administrador del Hotel';
    if (role === 'OPERATOR' || role === 'OPERARIO') return 'Operador de Recepción';
    return 'Huésped MontClair Privilège';
  });
}

