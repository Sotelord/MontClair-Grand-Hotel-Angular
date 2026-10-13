import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Service } from '../models/service.model';

@Injectable({
  providedIn: 'root',
})
export class ServicesService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/services';
  private serviceArray: Service[] = [];
  private readonly serviceArraySubject = new BehaviorSubject<Service[]>([]);
  readonly services$ = this.serviceArraySubject.asObservable();

  constructor() {
    this.loadFromBackend();
  }

  private syncServiceArray(data: Service[]): void {
    this.serviceArray = [...data];
    this.serviceArraySubject.next([...this.serviceArray]);
  }

  findAll(): Observable<Service[]> {
    return this.http.get<Service[]>(this.apiUrl).pipe(
      tap((data) => {
        const normalized = (data || []).map((s) => ({
          ...s,
          highlights: s.highlights || [],
          galleryImages: s.galleryImages || [],
        }));
        this.syncServiceArray(normalized);
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
          this.syncServiceArray([...this.serviceArray, saved]);
        }
      }),
    );
  }

  update(id: number, service: Service): Observable<Service> {
    return this.http.put<Service>(`${this.apiUrl}/${id}`, service).pipe(
      tap((updated) => {
        const nextServices = this.serviceArray.map((s) =>
          s.id === id
            ? {
                ...s,
                ...updated,
                highlights: updated.highlights || s.highlights || [],
                galleryImages: updated.galleryImages || s.galleryImages || [],
              }
            : s,
        );
        this.syncServiceArray(nextServices);
      }),
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.syncServiceArray(this.serviceArray.filter((s) => s.id !== id));
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
    return [...this.serviceArray];
  }

  getServiceById(id: number): Service | undefined {
    return this.serviceArray.find((service) => service.id === id);
  }
}
