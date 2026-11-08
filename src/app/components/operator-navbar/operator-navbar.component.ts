import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-operator-navbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './operator-navbar.component.html',
  styleUrl: './operator-navbar.component.scss',
})
export class OperatorNavbarComponent {
  private router = inject(Router);
  private authService = inject(AuthService);

  isMenuOpen = false;

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
