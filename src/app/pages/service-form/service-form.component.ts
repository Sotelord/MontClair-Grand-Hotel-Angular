import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ServicesService } from '../../service/services.service';
import { Service } from '../../models/service.model';
import { ServiceFormBannerComponent } from './components/service-form-banner/service-form-banner.component';
import { ServiceMainFieldsComponent } from './components/service-main-fields/service-main-fields.component';
import { ServiceDetailsFieldsComponent } from './components/service-details-fields/service-details-fields.component';
import { ServiceImageFieldComponent } from './components/service-image-field/service-image-field.component';
import { ServiceFormActionsComponent } from './components/service-form-actions/service-form-actions.component';

@Component({
  selector: 'app-service-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ServiceFormBannerComponent,
    ServiceMainFieldsComponent,
    ServiceDetailsFieldsComponent,
    ServiceImageFieldComponent,
    ServiceFormActionsComponent,
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
    if (this.serviceForm.invalid) {
      this.serviceForm.markAllAsTouched();
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
      name: formValue.name,
      description: formValue.description,
      price: Number(formValue.price),
      imageUrl: formValue.imageUrl,
      tag: formValue.tag,
      schedule: formValue.schedule,
    };

    if (this.isEditMode && this.currentServiceId) {
      this.servicesService.update(this.currentServiceId, service).subscribe({
        next: () => this.router.navigate(['/admin/services']),
        error: () => {},
      });
    } else {
      this.servicesService.add(service).subscribe({
        next: () => this.router.navigate(['/admin/services']),
        error: () => {},
      });
    }
  }
}
