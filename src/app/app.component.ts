import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { AdminNavbarComponent } from './components/admin-navbar/admin-navbar.component';
import { AdminFooterComponent } from './components/admin-footer/admin-footer.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
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

  isAdmin(): boolean {
    return this.router.url.startsWith('/admin');
  }
}
