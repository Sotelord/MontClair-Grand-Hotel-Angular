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

  findAll(): Observable<Service[]> {
    return this.http.get<Service[]>(this.apiUrl).pipe(
      tap((data) => {
        if (data && data.length > 0) {
          this.serviceArray = data.map((s) => ({
            ...s,
            highlights: s.highlights || [],
            galleryImages: s.galleryImages || [],
            hidden: s.hidden === true,
          }));
        }
      }),
    );
  }

  findById(id: number): Observable<Service> {
    return this.http.get<Service>(`${this.apiUrl}/${id}`);
  }

  add(service: Service | Omit<Service, 'id'>): Observable<Service> {
    const { id, ...payload } = service as any;
    return this.http.post<Service>(this.apiUrl, payload).pipe(
      tap((saved) => {
        if (saved) {
          this.serviceArray.push(saved);
        }
      }),
    );
  }

  update(id: number, service: Service): Observable<Service> {
    return this.http.put<Service>(`${this.apiUrl}/${id}`, service).pipe(
      tap((updated) => {
        const idx = this.serviceArray.findIndex((s) => s.id === id);
        if (idx !== -1) {
          this.serviceArray[idx] = updated;
        }
      }),
    );
  }

  toggleVisibility(service: Service): Observable<Service> {
    return this.update(service.id, {
      ...service,
      hidden: !service.hidden,
    });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.serviceArray = this.serviceArray.filter((s) => s.id !== id);
      }),
    );
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
}
