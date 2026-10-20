import { Component, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';

import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { AdminNavbarComponent } from './components/admin-navbar/admin-navbar.component';
import { AdminFooterComponent } from './components/admin-footer/admin-footer.component';
import { AuthService } from './service/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    NavbarComponent,
    FooterComponent,
    AdminNavbarComponent,
    AdminFooterComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  router = inject(Router);
  authService = inject(AuthService);

  isAdmin(): boolean {
    return (
      this.router.url.startsWith('/admin') &&
      this.authService.getSession()?.role?.toUpperCase() === 'ADMIN'
    );
  }

  isLoginPage(): boolean {
    return this.router.url.startsWith('/login');
  }
}
