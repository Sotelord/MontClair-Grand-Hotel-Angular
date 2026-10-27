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

  logout(): void {
    this.authService.clearSession();
    this.router.navigate(['/login']);
  }
}
