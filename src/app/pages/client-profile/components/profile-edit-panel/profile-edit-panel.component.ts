import { Component, effect, inject, input, output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Client } from '../../../../models/client.model';
import { ClientService } from '../../../../service/client.service';
import { AuthService } from '../../../../service/auth.service';
import { EditHeaderComponent } from '../../../profile-edit/components/edit-header/edit-header.component';
import { PersonalFieldsComponent } from '../../../profile-edit/components/personal-fields/personal-fields.component';
import { AvatarFieldComponent } from '../../../profile-edit/components/avatar-field/avatar-field.component';
import { PasswordFieldsComponent } from '../../../profile-edit/components/password-fields/password-fields.component';
import { ErrorAlertComponent } from '../../../../components/error-alert/error-alert.component';

@Component({
  selector: 'app-profile-edit-panel',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    EditHeaderComponent,
    PersonalFieldsComponent,
    AvatarFieldComponent,
    PasswordFieldsComponent,
    ErrorAlertComponent,
  ],
  templateUrl: './profile-edit-panel.component.html',
  styleUrl: './profile-edit-panel.component.scss',
})
export class ProfileEditPanelComponent {
  private fb = inject(FormBuilder);
  private clientService = inject(ClientService);
  private authService = inject(AuthService);

  client = input.required<Client>();
  profileUpdated = output<Client>();
  cancelRequested = output<void>();

  profileForm!: FormGroup;
  errorMessage: string | null = null;
  isSubmitting = false;

  readonly defaultAvatar =
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';

  constructor() {
    effect(() => {
      const current = this.client();
      this.initForm(current);
    });
  }

  private initForm(current: Client): void {
    this.profileForm = this.fb.group({
      firstName: [
        current.firstName,
        [Validators.required, Validators.minLength(2)],
      ],
      lastName: [current.lastName || ''],
      email: [current.email, [Validators.required, Validators.email]],
      phone: [
        current.phone || '',
        [Validators.pattern(/^[+0-9\s-]{7,20}$/)],
      ],
      avatarUrl: [current.avatarUrl || ''],
      newPassword: ['', [Validators.minLength(4)]],
      confirmPassword: [''],
    });
  }

  get avatarPreview(): string {
    const inputUrl = this.profileForm?.get('avatarUrl')?.value;
    return inputUrl && inputUrl.trim().length > 0
      ? inputUrl
      : this.client().avatarUrl || this.defaultAvatar;
  }

  onSubmit(): void {
    if (!this.profileForm) return;

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

    const current = this.client();
    const updatedClient: Client = {
      ...current,
      firstName: val.firstName.trim(),
      lastName: val.lastName ? val.lastName.trim() : '',
      email: val.email.trim(),
      phone: val.phone ? val.phone.trim() : '',
      avatarUrl: val.avatarUrl?.trim() || this.defaultAvatar,
      password:
        val.newPassword && val.newPassword.trim().length > 0
          ? val.newPassword.trim()
          : current.password,
    };

    this.clientService.update(current.id, updatedClient).subscribe({
      next: (saved) => {
        const finalClient = saved || updatedClient;
        const session = this.authService.getSession();
        if (!session || session.id === finalClient.id) {
          this.authService.saveSession(finalClient);
        }
        this.isSubmitting = false;
        this.profileUpdated.emit(finalClient);
      },
      error: () => {
        this.isSubmitting = false;
        this.errorMessage = 'Error al actualizar el perfil. Intente nuevamente.';
      },
    });
  }
}

