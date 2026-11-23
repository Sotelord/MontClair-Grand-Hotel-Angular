import {
  Component,
  ElementRef,
  HostListener,
  inject,
  ViewChild,
} from '@angular/core';
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

  @ViewChild('profileMenuContainer')
  profileMenuContainer?: ElementRef<HTMLElement>;

  isMenuOpen = false;
  isProfileMenuOpen = false;
  avatarLoadError = false;

  get currentClient(): Client | null {
    return this.authService.getSession();
  }

  get isBlueHeaderPage(): boolean {
    return false;
  }

  getDisplayName(client: Client): string {
    const full = [client.firstName, client.lastName]
      .filter((part) => !!part && part.trim().length > 0)
      .join(' ')
      .trim();
    return full || client.username;
  }

  getShortName(client: Client): string {
    return (client.firstName || client.username || 'Huésped').trim();
  }

  getInitials(client: Client): string {
    const first = (client.firstName || client.username || '').trim();
    const last = (client.lastName || '').trim();
    if (first && last) {
      return `${first[0]}${last[0]}`.toUpperCase();
    }
    return first.slice(0, 2).toUpperCase() || 'MG';
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
    if (this.isMenuOpen) {
      this.isProfileMenuOpen = false;
    }
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  toggleProfileMenu(event: Event): void {
    event.stopPropagation();
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  closeProfileMenu(): void {
    this.isProfileMenuOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.isProfileMenuOpen) {
      return;
    }
    const target = event.target as Node | null;
    if (
      this.profileMenuContainer &&
      target &&
      !this.profileMenuContainer.nativeElement.contains(target)
    ) {
      this.isProfileMenuOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.isProfileMenuOpen = false;
    this.isMenuOpen = false;
  }

  logout(): void {
    this.closeMenu();
    this.closeProfileMenu();
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login']),
    });
  }
}
