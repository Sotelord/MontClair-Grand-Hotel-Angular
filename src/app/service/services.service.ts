import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Service } from '../models/service.model';
import { environment } from '../../environments/environment';

// Acceso a la API REST de servicios del hotel (/api/services).
@Injectable({
  providedIn: 'root',
})
export class ServicesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/services`;
  private servicesSubject = new BehaviorSubject<Service[]>([]);
  readonly services$ = this.servicesSubject.asObservable();

  constructor() {
    this.findAll().subscribe({ error: () => {} });
  }

  // Lista todos los servicios, incluidos los ocultos (uso administrativo).
  findAll(): Observable<Service[]> {
    return this.http.get<Service[]>(this.apiUrl).pipe(
      tap((services) => this.servicesSubject.next(services)),
    );
  }

  // Lista solo los servicios visibles al público.
  findNotHidden(): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.apiUrl}/nothidden`);
  }

  // Busca un servicio por su id.
  findById(id: number): Observable<Service> {
    return this.http.get<Service>(`${this.apiUrl}/${id}`);
  }

  // Crea un servicio.
  add(service: Service | Omit<Service, 'id'>): Observable<Service> {
    const { id, ...payload } = service as any;
    return this.http.post<Service>(this.apiUrl, payload).pipe(
      tap((created) => this.servicesSubject.next([
        ...this.servicesSubject.value,
        created,
      ])),
    );
  }

  // Reemplaza los datos de un servicio (PUT).
  update(id: number, service: Service): Observable<Service> {
    return this.http.put<Service>(`${this.apiUrl}/${id}`, service).pipe(
      tap((updated) => this.servicesSubject.next(
        this.servicesSubject.value.map((item) => item.id === id ? updated : item),
      )),
    );
  }

  // Muestra u oculta un servicio invirtiendo su campo `hidden`.
  toggleVisibility(service: Service): Observable<Service> {
    return this.update(service.id, {
      ...service,
      hidden: !service.hidden,
    });
  }

  // Elimina un servicio.
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.servicesSubject.next(
        this.servicesSubject.value.filter((item) => item.id !== id),
      )),
    );
  }
}
