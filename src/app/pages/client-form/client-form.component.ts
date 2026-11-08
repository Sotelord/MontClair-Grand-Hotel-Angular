import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClientService } from '../../service/client.service';
import { Client } from '../../models/client.model';
import { ClientFormHeaderComponent } from './components/client-form-header/client-form-header.component';
import { PersonalInfoFieldsComponent } from './components/personal-info-fields/personal-info-fields.component';
import { ErrorAlertComponent } from '../../components/error-alert/error-alert.component';
import { AccountFieldsComponent } from './components/account-fields/account-fields.component';
import { ProfileFieldsComponent } from './components/profile-fields/profile-fields.component';
import { ClientFormActionsComponent } from './components/client-form-actions/client-form-actions.component';
import { LoginLinkComponent } from './components/login-link/login-link.component';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ClientFormHeaderComponent,
    PersonalInfoFieldsComponent,
    ErrorAlertComponent,
    AccountFieldsComponent,
    ProfileFieldsComponent,
    ClientFormActionsComponent,
    LoginLinkComponent,
  ],
  templateUrl: './client-form.component.html',
  styleUrl: './client-form.component.scss',
})
export class ClientFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private clientService = inject(ClientService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  clientForm!: FormGroup;
  isEditMode: boolean = false;
  clientId?: number;
  isAdminView: boolean = false;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.isAdminView = this.router.url.includes('/admin');
    this.initForm();

    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.isEditMode = true;
      this.clientId = Number(idParam);

      this.clientService.findById(this.clientId).subscribe({
        next: (existing) => {
          if (existing) {
            this.clientForm.patchValue({
              firstName: existing.firstName,
              lastName: existing.lastName || '',
              username: existing.username,
              email: existing.email,
              password: existing.password,
              phone: existing.phone || '',
              avatarUrl: existing.avatarUrl || '',
              role: existing.role || 'CLIENT',
            });
          } else {
            this.router.navigate([
              this.isAdminView ? '/admin/clients' : '/login',
            ]);
          }
        },
        error: () => {
          this.router.navigate([
            this.isAdminView ? '/admin/clients' : '/login',
          ]);
        },
      });
    }
  }

  private initForm(): void {
    this.clientForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(3)]],
      phone: [''],
      avatarUrl: [''],
      role: ['CLIENT', [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      this.errorMessage =
        'Por favor completa todos los campos requeridos correctamente.';
      return;
    }

    const val = this.clientForm.value;

    const clientData: Omit<Client, 'id'> = {
      firstName: val.firstName.trim(),
      lastName: val.lastName.trim(),
      username: val.username.trim(),
      email: val.email.trim(),
      password: val.password.trim(),
      phone: val.phone?.trim() || undefined,
      avatarUrl: val.avatarUrl?.trim() || undefined,
      role: val.role || 'CLIENT',
    };

    if (this.isEditMode && this.clientId) {
      this.clientService
        .update(this.clientId, {
          ...clientData,
          id: this.clientId,
        })
        .subscribe({
          next: (updated) => {
            this.router.navigate(
              this.isAdminView ? ['/admin/clients'] : ['/profile', updated.id],
            );
          },
          error: () => {
            this.errorMessage =
              'Error al actualizar el cliente en el servidor.';
          },
        });
    } else {
      this.clientService.add(clientData).subscribe({
        next: (savedClient) => {
          if (this.isAdminView) {
            this.router.navigate(['/admin/clients']);
          } else {
            this.router.navigate(['/profile', savedClient.id]);
          }
        },
        error: () => {
          this.errorMessage =
            'Error al registrar el cliente. Verifique que el usuario o correo no existan ya.';
        },
      });
    }
  }
}
