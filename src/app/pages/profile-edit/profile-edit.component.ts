import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ClientService } from '../../service/client.service';
import { Client } from '../../models/client.model';
import { ProfileBreadcrumbComponent } from './components/profile-breadcrumb/profile-breadcrumb.component';
import { EditHeaderComponent } from './components/edit-header/edit-header.component';
import { ErrorAlertComponent } from '../../components/error-alert/error-alert.component';
import { SuccessAlertComponent } from '../../components/success-alert/success-alert.component';
import { PersonalFieldsComponent } from './components/personal-fields/personal-fields.component';
import { AvatarFieldComponent } from './components/avatar-field/avatar-field.component';
import { PasswordFieldsComponent } from './components/password-fields/password-fields.component';
import { EditActionsComponent } from './components/edit-actions/edit-actions.component';
import { AuthService } from '../../service/auth.service';
import { PageHeaderComponent } from '../../components/page-header/page-header.component';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PageHeaderComponent,
    ProfileBreadcrumbComponent,
    EditHeaderComponent,
    ErrorAlertComponent,
    SuccessAlertComponent,
    PersonalFieldsComponent,
    AvatarFieldComponent,
    PasswordFieldsComponent,
    EditActionsComponent,
  ],
  templateUrl: './profile-edit.component.html',
  styleUrl: './profile-edit.component.scss',
})
export class ProfileEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private clientService = inject(ClientService);
  private router = inject(Router);
  private authService = inject(AuthService);

  client: Client | null = null;
  profileForm!: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isSubmitting: boolean = false;

  defaultAvatar =
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';

  ngOnInit(): void {
    if (!this.authService.getToken() && !this.authService.getSession()) {
      this.router.navigate(['/login']);
      return;
    }

    this.clientService.getMyDetails().subscribe({
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
      email: [this.client.email, [Validators.required, Validators.email]],
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
      : this.client?.avatarUrl || this.defaultAvatar;
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
      next: () => {
        this.successMessage = '¡Perfil actualizado con éxito!';
        this.isSubmitting = false;

        this.router.navigate(['/profile']);
      },
      error: () => {
        this.isSubmitting = false;
        this.errorMessage = 'Error al actualizar el perfil.';
      },
    });
  }
}
