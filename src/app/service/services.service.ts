import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Service } from '../models/service.model';
import { environment } from '../../environments/environment';

// Acceso a la API REST de servicios del hotel (/api/services).
@Injectable({
  providedIn: 'root',
})
export class ServicesService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/services`;

  // Servicios de respaldo oficiales de MontClair
  private readonly defaultServices: Service[] = [
    {
      id: 1,
      tag: 'restaurant',
      name: 'Restaurante Gourmet',
      description: 'Gastronomía de autor con ingredientes locales frescos y maridajes exclusivos.',
      price: 65.0,
      priceLabel: 'Por persona',
      schedule: '07:00 - 23:00',
      imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      highlights: [],
      galleryImages: [],
      hidden: false,
    },
    {
      id: 2,
      tag: 'spa',
      name: 'Spa & Circuito Termal',
      description: 'Masajes holísticos, sauna, baño turco y piscina de hidroterapia relajante.',
      price: 85.0,
      priceLabel: 'Por sesión',
      schedule: '09:00 - 21:00',
      imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
      highlights: [],
      galleryImages: [],
      hidden: false,
    },
    {
      id: 3,
      tag: 'pool',
      name: 'Piscina Infinity & Solárium',
      description: 'Piscina exterior climatizada con vistas panorámicas y coctelería premium.',
      price: 0.0,
      priceLabel: 'Incluido en estadía',
      schedule: '08:00 - 20:00',
      imageUrl: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80',
      highlights: [],
      galleryImages: [],
      hidden: false,
    },
    {
      id: 4,
      tag: 'roomservice',
      name: 'Room Service 24 Horas',
      description: 'Atención personalizada y servicio de alimentos gourmet en su suite en cualquier momento.',
      price: 25.0,
      priceLabel: 'Tarifa de servicio',
      schedule: '24 Horas',
      imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
      highlights: [],
      galleryImages: [],
      hidden: false,
    },
  ];

  // Lista todos los servicios, incluidos los ocultos (uso administrativo).
  findAll(): Observable<Service[]> {
    return this.http.get<Service[]>(this.apiUrl).pipe(
      map((services) => (services && services.length > 0 ? services : this.defaultServices)),
      catchError(() => of(this.defaultServices)),
    );
  }

  // Lista solo los servicios visibles al público.
  findNotHidden(): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.apiUrl}/nothidden`).pipe(
      map((services) => (services && services.length > 0 ? services : this.defaultServices)),
      catchError(() => of(this.defaultServices)),
    );
  }

  // Busca un servicio por su id.
  findById(id: number): Observable<Service> {
    return this.http.get<Service>(`${this.apiUrl}/${id}`).pipe(
      catchError(() => {
        const found = this.defaultServices.find((s) => s.id === id);
        return of(found || this.defaultServices[0]);
      }),
    );
  }

  // Crea un servicio.
  add(service: Service | Omit<Service, 'id'>): Observable<Service> {
    const { id, ...payload } = service as any;
    return this.http.post<Service>(this.apiUrl, payload);
  }

  // Reemplaza los datos de un servicio (PUT).
  update(id: number, service: Service): Observable<Service> {
    return this.http.put<Service>(`${this.apiUrl}/${id}`, service);
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
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
