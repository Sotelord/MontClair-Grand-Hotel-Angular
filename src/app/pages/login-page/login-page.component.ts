import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { LoginHeaderComponent } from './components/login-header/login-header.component';
import { LoginAlertComponent } from './components/login-alert/login-alert.component';
import { LoginFormComponent } from './components/login-form/login-form.component';
import { DemoAccessComponent } from './components/demo-access/demo-access.component';
import { RegisterPromptComponent } from './components/register-prompt/register-prompt.component';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    LoginHeaderComponent,
    LoginAlertComponent,
    LoginFormComponent,
    DemoAccessComponent,
    RegisterPromptComponent,
  ],
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
  isLoading = false;
  isGoogleLoading = false;

  ngOnInit(): void {
    // Limpiar cualquier sesión residual al entrar a la pantalla de login para evitar iniciar como operario/admin por error
    this.authService.clearSession();

    if (this.route.snapshot.queryParamMap.get('registered')) {
      this.successMessage =
        '¡Registro completado! Ya puedes iniciar sesión con tus credenciales.';
    }
  }

  onLogin(): void {
    this.errorMessage = null;

    const cleanId = this.identifier.trim();
    const cleanPass = this.password.trim();

    if (!cleanId || !cleanPass) {
      this.errorMessage = 'Por favor ingresa usuario/correo y contraseña.';
      return;
    }

    this.isLoading = true;
    this.authService.login(cleanId, cleanPass).subscribe({
      next: (result) => {
        this.isLoading = false;
        if (result.success && result.client) {
          this.router.navigate(this.authService.getRedirectForClient(result.client));
        } else {
          this.errorMessage =
            result.message || 'Usuario o contraseña incorrectos.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err?.error?.message || 'Usuario o contraseña incorrectos.';
      },
    });
  }

  onGoogleLogin(): void {
    this.errorMessage = null;
    this.isGoogleLoading = true;
    this.authService.getGoogleStartUrl().subscribe({
      next: (result) => {
        if (!result.authorizationUrl) {
          this.isGoogleLoading = false;
          this.errorMessage = 'No se pudo iniciar el acceso con Google.';
          return;
        }
        window.location.assign(result.authorizationUrl);
      },
      error: (err) => {
        this.isGoogleLoading = false;
        this.errorMessage =
          err?.error?.message || 'No se pudo iniciar el acceso con Google.';
      },
    });
  }

  fillDemo(user: 'admin' | 'operario' | 'demo'): void {
    if (user === 'admin') {
      this.identifier = 'admin';
      this.password = 'admin';
    } else if (user === 'operario') {
      this.identifier = 'operario';
      this.password = 'operario';
    } else {
      this.identifier = 'demo';
      this.password = 'demo';
    }

    this.onLogin();
  }
}
