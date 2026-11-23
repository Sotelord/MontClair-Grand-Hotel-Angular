import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ServicesService } from '../../service/services.service';
import { Service } from '../../models/service.model';
import { ServiceFormBannerComponent } from './components/service-form-banner/service-form-banner.component';
import { ServiceMainFieldsComponent } from './components/service-main-fields/service-main-fields.component';
import { ServiceDetailsFieldsComponent } from './components/service-details-fields/service-details-fields.component';
import { ServiceImageFieldComponent } from './components/service-image-field/service-image-field.component';
import { ServiceFormActionsComponent } from './components/service-form-actions/service-form-actions.component';
import { ErrorAlertComponent } from '../../components/error-alert/error-alert.component';

@Component({
  selector: 'app-service-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ServiceFormBannerComponent,
    ServiceMainFieldsComponent,
    ServiceDetailsFieldsComponent,
    ServiceImageFieldComponent,
    ServiceFormActionsComponent,
    ErrorAlertComponent,
  ],
  templateUrl: './service-form.component.html',
  styleUrl: './service-form.component.scss',
})
export class ServiceFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private servicesService = inject(ServicesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  serviceForm: FormGroup;
  isEditMode: boolean = false;
  currentServiceId?: number;
  private currentService?: Service;

  errorMessage: string | null = null;
  isSubmitting = false;

  constructor() {
    this.serviceForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      imageUrl: ['', Validators.required],
      tag: ['', Validators.required],
      schedule: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.currentServiceId = Number(idParam);
      this.servicesService.findById(this.currentServiceId).subscribe({
        next: (service) => {
          if (service) {
            this.currentService = service;
            this.serviceForm.patchValue(service);
          } else {
            this.router.navigate(['/admin/services']);
          }
        },
        error: () => {
          this.router.navigate(['/admin/services']);
        },
      });
    }
  }

  handleSubmit(): void {
    this.errorMessage = null;

    if (this.serviceForm.invalid) {
      this.serviceForm.markAllAsTouched();
      this.errorMessage =
        'Por favor completa correctamente los campos marcados.';
      return;
    }

    if (this.isSubmitting) {
      return;
    }

    const formValue = this.serviceForm.value;
    const service: Service = {
      id: 0,
      icon: '',
      highlights: [],
      galleryImages: [],
      hidden: false,
      ...this.currentService,
      name: formValue.name.trim(),
      description: formValue.description.trim(),
      price: Number(formValue.price),
      imageUrl: formValue.imageUrl.trim(),
      tag: formValue.tag.trim(),
      schedule: formValue.schedule.trim(),
    };

    this.isSubmitting = true;

    const request$ =
      this.isEditMode && this.currentServiceId
        ? this.servicesService.update(this.currentServiceId, service)
        : this.servicesService.add(service);

    request$.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/admin/services']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage =
          err?.error?.message ||
          (this.isEditMode
            ? 'No se pudo actualizar el servicio. Intenta nuevamente.'
            : 'No se pudo guardar el servicio. Verifica que el nombre no exista ya.');
      },
    });
  }
}
