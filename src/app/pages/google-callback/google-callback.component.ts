import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../service/auth.service';
import { Client } from '../../models/client.model';

@Component({
  selector: 'app-google-callback',
  standalone: true,
  template: `
    <div class="flex items-center justify-center p-8">
      <p class="text-sm font-bold uppercase tracking-widest text-woodsmoke">
        {{ errorMessage || 'Completando inicio de sesión...' }}
      </p>
    </div>
  `,
})
export class GoogleCallbackComponent implements OnInit {
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private processed = false;

  errorMessage: string | null = null;

  ngOnInit(): void {
    const error = this.route.snapshot.queryParamMap.get('error');
    const code = this.route.snapshot.queryParamMap.get('code');

    if (!code) {
      this.errorMessage = error
        ? 'Google canceló el inicio de sesión.'
        : 'No se recibió el código de autenticación.';
      return;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      replaceUrl: true,
      queryParams: {},
    });

    if (this.processed) return;
    this.processed = true;

    this.auth.exchangeGoogleCode(code).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (result) => {
        const client = 'client' in result ? result.client : this.profileFromResult(result);
        if (!client) {
          this.errorMessage = 'El backend no confirmó una sesión válida.';
          return;
        }
        this.auth.setCurrentUser(client);
        this.router.navigate(this.auth.getRedirectForClient(client));
      },
      error: (err) => {
        this.errorMessage =
          err?.error?.message || 'No se pudo completar el inicio de sesión con Google.';
      },
    });
  }

  private profileFromResult(result: unknown): Client | undefined {
    if (!result || typeof result !== 'object') return undefined;
    const record = result as Record<string, unknown>;
    return typeof record['id'] === 'number' ? record as unknown as Client : undefined;
  }
}
