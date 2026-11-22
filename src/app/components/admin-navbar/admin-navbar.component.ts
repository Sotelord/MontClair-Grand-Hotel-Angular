import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';
import { NgClass } from '@angular/common';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../service/auth.service';

interface AdminNavItem {
  path: string;
  label: string;
  icon: string;
  matches: string[];
}

@Component({
  selector: 'app-admin-navbar',
  standalone: true,
  imports: [RouterLink, NgClass],
  templateUrl: './admin-navbar.component.html',
  styleUrl: './admin-navbar.component.scss',
})
export class AdminNavbarComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  isMenuOpen = false;
  private currentUrl = signal(this.cleanUrl(this.router.url));

  constructor() {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe((e) =>
        this.currentUrl.set(this.cleanUrl(e.urlAfterRedirects)),
      );
  }

  isActive(item: AdminNavItem): boolean {
    const url = this.currentUrl();
    return item.matches.some((p) => url === p || url.startsWith(p + '/'));
  }

  private cleanUrl(url: string): string {
    return url.split(/[?#]/)[0];
  }

  readonly navItems: AdminNavItem[] = [
    {
      path: '/admin/rooms',
      matches: ['/admin/rooms'],
      label: 'Habitaciones',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    },
    {
      path: '/admin/rooms-types',
      matches: ['/admin/rooms-types', '/admin/room-types'],
      label: 'Tipos de Habitación',
      icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
    },
    {
      path: '/admin/reservations',
      matches: ['/admin/reservations'],
      label: 'Reservas',
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    },
    {
      path: '/admin/clients',
      matches: ['/admin/clients'],
      label: 'Clientes',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    },
    {
      path: '/admin/services',
      matches: ['/admin/services'],
      label: 'Servicios',
      icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
    },
  ];

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
