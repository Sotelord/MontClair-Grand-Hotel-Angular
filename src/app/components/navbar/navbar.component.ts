import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { Client } from '../../models/client.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass],
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
    return false;
  }

  navLinkClass(isActive: boolean): string {
    if (this.isBlueHeaderPage) {
      return isActive
        ? 'text-[#D9C08E] border-[#D9C08E] font-bold'
        : 'text-white hover:text-[#E8D8B5] border-transparent';
    }
    return isActive
      ? 'text-twine border-twine font-bold'
      : 'text-woodsmoke hover:text-twine border-transparent';
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  logout(): void {
    this.closeMenu();
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login']),
    });
  }
}
