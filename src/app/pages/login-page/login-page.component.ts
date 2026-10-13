import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../service/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
})
export class LoginPageComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  identifier: string = '';
  password: string = '';

  errorMessage: string | null = null;
  successMessage: string | null = null;

  ngOnInit(): void {
    if (this.route.snapshot.queryParamMap.get('registered')) {
      this.successMessage = '¡Registro completado! Ya puedes iniciar sesión con tus credenciales.';
    }
  }

  onLogin(): void {
    this.errorMessage = null;

    if (!this.identifier.trim() || !this.password.trim()) {
      this.errorMessage = 'Por favor ingresa usuario/correo y contraseña.';
      return;
    }

    const result = this.authService.login(this.identifier, this.password);

    if (result.success && result.client) {
      if (result.client.role?.toUpperCase() === 'ADMIN') {
        this.router.navigate(['/admin/rooms']);
      } else {
        this.router.navigate(['/profile']);
      }
    } else {
      this.errorMessage = result.message || 'Usuario o contraseña incorrectos.';
    }
  }

  fillDemo(user: 'admin' | 'demo'): void {
    if (user === 'admin') {
      this.identifier = 'admin';
      this.password = 'admin';
    } else {
      this.identifier = 'demo';
      this.password = 'demo';
    }
    this.onLogin();
  }
}
