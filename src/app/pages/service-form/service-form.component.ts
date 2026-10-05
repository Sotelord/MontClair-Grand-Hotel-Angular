import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ServicesService } from '../../service/services.service';
import { Service } from '../../models/service.model';

@Component({
  selector: 'app-service-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './service-form.component.html',
  styleUrl: './service-form.component.scss'
})
export class ServiceFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private servicesService = inject(ServicesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  serviceForm: FormGroup;
  isEditMode: boolean = false;
  currentServiceId?: number;

  constructor() {
    this.serviceForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      imageUrl: ['', Validators.required],
      tag: ['', Validators.required],
      schedule: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.currentServiceId = Number(idParam);
      const service = this.servicesService.getServiceById(this.currentServiceId);
      
      if (service) {
        this.serviceForm.patchValue(service);
      } else {
        this.router.navigate(['/admin/services']);
      }
    }
  }

  handleSubmit(): void {
    if (this.serviceForm.invalid) {
      this.serviceForm.markAllAsTouched();
      return;
    }

    const formValue = this.serviceForm.value;
    const service: Service = {
      id: this.currentServiceId || 0,
      name: formValue.name,
      description: formValue.description,
      price: Number(formValue.price),
      imageUrl: formValue.imageUrl,
      icon: '',
      tag: formValue.tag,
      schedule: formValue.schedule,
      highlights: [],
      galleryImages: [],
      hidden: false
    };

    if (this.isEditMode) {
      this.servicesService.updateService(service);
    } else {
      this.servicesService.addService(service);
    }

    this.router.navigate(['/admin/services']);
  }
}
