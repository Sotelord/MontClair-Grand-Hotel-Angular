import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../service/auth.service';
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
  authService = inject(AuthService);
  private clientService = inject(ClientService);
  private router = inject(Router);

  client: Client | null = null;
  profileForm!: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isSubmitting: boolean = false;

  defaultAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';

  ngOnInit(): void {
    this.client = this.authService.currentUser();
    if (!this.client) {
      this.router.navigate(['/login']);
      return;
    }

    this.profileForm = this.fb.group({
      firstName: [this.client.firstName, [Validators.required, Validators.minLength(2)]],
      lastName: [this.client.lastName || ''],
      email: [this.client.email, [Validators.required, Validators.email]],
      phone: [this.client.phone || '', [Validators.pattern(/^[+0-9\s-]{7,20}$/)]],
      avatarUrl: [this.client.avatarUrl || ''],
      newPassword: ['', [Validators.minLength(4)]],
      confirmPassword: [''],
    });
  }

  get avatarPreview(): string {
    const inputUrl = this.profileForm?.get('avatarUrl')?.value;
    return inputUrl && inputUrl.trim().length > 0 ? inputUrl : (this.client?.avatarUrl || this.defaultAvatar);
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.errorMessage = 'Por favor complete correctamente todos los campos obligatorios.';
      return;
    }

    if (!this.client) return;

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
      password: (val.newPassword && val.newPassword.trim().length > 0) ? val.newPassword.trim() : this.client.password,
    };

    const result = this.clientService.updateClient(updatedClient);

    if (result.success) {
      this.authService.setCurrentUser(updatedClient);
      this.successMessage = '¡Perfil actualizado con éxito!';
      setTimeout(() => {
        this.router.navigate(['/profile']);
      }, 1200);
    } else {
      this.isSubmitting = false;
      this.errorMessage = result.message || 'Error al actualizar el perfil.';
    }
  }
}
