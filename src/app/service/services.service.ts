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
  private servicesSubject = new BehaviorSubject<Service[]>([]);
  readonly services$ = this.servicesSubject.asObservable();

  constructor() {
    this.findAll().subscribe();
  }

  findAll(): Observable<Service[]> {
    return this.http.get<Service[]>(this.apiUrl).pipe(
      tap((services) => this.servicesSubject.next(services)),
    );
  }

  findNotHidden(): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.apiUrl}/nothidden`);
  }

  findById(id: number): Observable<Service> {
    return this.http.get<Service>(`${this.apiUrl}/${id}`);
  }

  add(service: Service | Omit<Service, 'id'>): Observable<Service> {
    const { id, ...payload } = service as any;
    return this.http.post<Service>(this.apiUrl, payload).pipe(
      tap((created) => this.servicesSubject.next([
        ...this.servicesSubject.value,
        created,
      ])),
    );
  }

  update(id: number, service: Service): Observable<Service> {
    return this.http.put<Service>(`${this.apiUrl}/${id}`, service).pipe(
      tap((updated) => this.servicesSubject.next(
        this.servicesSubject.value.map((item) => item.id === id ? updated : item),
      )),
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
      tap(() => this.servicesSubject.next(
        this.servicesSubject.value.filter((item) => item.id !== id),
      )),
    );
  }
}
