
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ClientService } from '../../service/client.service';
import { Client } from '../../models/client.model';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './profile-edit.component.html',
  styleUrl: './profile-edit.component.scss',
})
export class ProfileEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private clientService = inject(ClientService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  client: Client | null = null;
  profileForm!: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isSubmitting: boolean = false;

  defaultAvatar =
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const clientId = idParam ? Number(idParam) : null;

    if (!clientId) {
      this.router.navigate(['/login']);
      return;
    }

    this.clientService.findById(clientId).subscribe({
      next: (client) => {
        this.client = client;
        this.initForm();
      },
      error: () => {
        this.router.navigate(['/login']);
      },
    });
  }

  private initForm(): void {
    if (!this.client) return;

    this.profileForm = this.fb.group({
      firstName: [
        this.client.firstName,
        [Validators.required, Validators.minLength(2)],
      ],
      lastName: [this.client.lastName || ''],
      email: [
        this.client.email,
        [Validators.required, Validators.email],
      ],
      phone: [
        this.client.phone || '',
        [Validators.pattern(/^[+0-9\s-]{7,20}$/)],
      ],
      avatarUrl: [this.client.avatarUrl || ''],
      newPassword: ['', [Validators.minLength(4)]],
      confirmPassword: [''],
    });
  }

  get avatarPreview(): string {
    const inputUrl = this.profileForm?.get('avatarUrl')?.value;

    return inputUrl && inputUrl.trim().length > 0
      ? inputUrl
      : (this.client?.avatarUrl || this.defaultAvatar);
  }

  onSubmit(): void {
    if (!this.profileForm || !this.client) return;

    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.errorMessage =
        'Por favor complete correctamente todos los campos obligatorios.';
      return;
    }

    const val = this.profileForm.value;

    if (val.newPassword && val.newPassword.length > 0) {
      if (val.newPassword !== val.confirmPassword) {
        this.errorMessage = 'Las contraseñas no coinciden.';
        return;
      }
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    const updatedClient: Client = {
      ...this.client,
      firstName: val.firstName.trim(),
      lastName: val.lastName ? val.lastName.trim() : '',
      email: val.email.trim(),
      phone: val.phone ? val.phone.trim() : '',
      avatarUrl: val.avatarUrl?.trim() || this.defaultAvatar,
      password:
        val.newPassword && val.newPassword.trim().length > 0
          ? val.newPassword.trim()
          : this.client.password,
    };

    this.clientService.update(this.client.id, updatedClient).subscribe({
      next: (savedClient) => {
        this.successMessage = '¡Perfil actualizado con éxito!';
        this.isSubmitting = false;

        this.router.navigate([
          '/profile',
          savedClient?.id || updatedClient.id,
        ]);
      },
      error: () => {
        this.isSubmitting = false;
        this.errorMessage = 'Error al actualizar el perfil.';
      },
    });
  }
}
