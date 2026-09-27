import { Component } from '@angular/core';
import { Client } from '../models/client.model';

@Component({
  selector: 'app-navbar',
  imports: [],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  client: Client = {
    id: 1,
    username: 'Juan Angarita',
    password: '123',
    email: 'ang.juang@ejemplo.com',
    firstName: 'Juan',
    avatarUrl:
      'https://media.licdn.com/dms/image/v2/D4E22AQE-l-S7vco9Gw/feedshare-shrink_800/feedshare-shrink_800/0/1700266673209?e=2147483647&v=beta&t=czbgsf0pymzsiiv58PEhRSFB5Byl1BRy3qv2DzrAxew',
    role: 'Client',
  };
}
