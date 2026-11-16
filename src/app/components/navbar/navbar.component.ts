import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { Client } from '../../models/client.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, NgClass],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  isMenuOpen = false;

  get currentClient(): Client | null {
    return this.authService.getSession();
  }

  get isBlueHeaderPage(): boolean {
    return (
      this.router.url.startsWith('/profile') ||
      this.router.url.startsWith('/reservations/book')
    );
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  logout(): void {
    this.closeMenu();
    this.authService.clearSession();
    this.router.navigate(['/login']);
  }
}
