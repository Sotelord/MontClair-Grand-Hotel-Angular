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
  private authService = inject(AuthService);
  private router = inject(Router);

  get currentClient(): Client | null {
    return this.authService.getSession();
  }

  logout(): void {
    this.authService.clearSession();
    this.router.navigate(['/login']);
  }
}
