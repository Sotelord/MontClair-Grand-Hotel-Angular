import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Service } from '../models/service.model';

@Injectable({
  providedIn: 'root',
})
export class ServicesService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/services';
  private serviceArray: Service[] = [];

  constructor() {
    this.loadFromBackend();
  }

  // REST API Observable Methods (Consumo Spring Boot)
  findAll(): Observable<Service[]> {
    return this.http.get<Service[]>(this.apiUrl).pipe(
      tap((data) => {
        if (data && data.length > 0) {
          this.serviceArray = data.map((s) => ({
            ...s,
            highlights: s.highlights || [],
            galleryImages: s.galleryImages || [],
          }));
        }
      })
    );
  }

  findById(id: number): Observable<Service> {
    return this.http.get<Service>(`${this.apiUrl}/${id}`);
  }

  add(service: Service): Observable<Service> {
    return this.http.post<Service>(this.apiUrl, service);
  }

  update(id: number, service: Service): Observable<Service> {
    return this.http.put<Service>(`${this.apiUrl}/${id}`, service);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private loadFromBackend(): void {
    this.findAll().subscribe({
      next: () => {},
      error: () => {},
    });
  }

  getServices(): Service[] {
    return this.serviceArray;
  }

  getServiceById(id: number): Service | undefined {
    return this.serviceArray.find((service) => service.id === id);
  }

  addService(service: Service): void {
    const newId = this.serviceArray.length > 0 ? Math.max(...this.serviceArray.map(s => s.id)) + 1 : 1;
    service.id = newId;
    this.serviceArray.push(service);
    this.add(service).subscribe({
      next: (res) => { if (res?.id) service.id = res.id; },
      error: () => {}
    });
  }

  updateService(service: Service): void {
    const index = this.serviceArray.findIndex((s) => s.id === service.id);
    if (index !== -1) {
      this.serviceArray[index] = service;
      this.update(service.id, service).subscribe({ error: () => {} });
    }
  }

  deleteService(service: Service): void {
    const index = this.serviceArray.findIndex((s) => s.id === service.id);
    if (index !== -1) {
      this.serviceArray.splice(index, 1);
      this.delete(service.id).subscribe({ error: () => {} });
    }
  }
}
