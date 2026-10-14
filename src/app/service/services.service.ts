import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Service } from '../models/service.model';

@Injectable({
  providedIn: 'root',
})
export class ServicesService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/services';

  findAll(): Observable<Service[]> {
    return this.http.get<Service[]>(this.apiUrl);
  }

  findNotHidden(): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.apiUrl}/nothidden`);
  }

  findById(id: number): Observable<Service> {
    return this.http.get<Service>(`${this.apiUrl}/${id}`);
  }

  add(service: Service | Omit<Service, 'id'>): Observable<Service> {
    const { id, ...payload } = service as any;
    return this.http.post<Service>(this.apiUrl, payload);
  }

  update(id: number, service: Service): Observable<Service> {
    return this.http.put<Service>(`${this.apiUrl}/${id}`, service);
  }

  toggleVisibility(service: Service): Observable<Service> {
    return this.update(service.id, {
      ...service,
      hidden: !service.hidden,
    });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
