import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { Client } from '../../models/client.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  get client(): Client | null {
    return this.authService.currentUser();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
