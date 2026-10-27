import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { AdminNavbarComponent } from './components/admin-navbar/admin-navbar.component';
import { OperatorNavbarComponent } from './components/operator-navbar/operator-navbar.component';
import { AdminFooterComponent } from './components/admin-footer/admin-footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NavbarComponent,
    FooterComponent,
    AdminNavbarComponent,
    OperatorNavbarComponent,
    AdminFooterComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'MontClair-Grand-Hotel-Angular';

  private router = inject(Router);
  isAdmin = signal<boolean>(false);
  isOperator = signal<boolean>(false);
  isLogin = signal<boolean>(false);

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.isAdmin.set(e.urlAfterRedirects.startsWith('/admin'));
        this.isOperator.set(e.urlAfterRedirects.startsWith('/operator'));
        this.isLogin.set(e.urlAfterRedirects.startsWith('/login'));
      });
  }
}
