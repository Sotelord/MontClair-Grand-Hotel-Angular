import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Service } from '../models/service.model';

/*Acceso a la API REST de servicios del hotel (/api/services).
Un servicio puede estar "oculto": el panel de administración lo ve siempre, pero las páginas públicas solo muestran los no ocultos.*/
@Injectable({
  providedIn: 'root',
})
export class ServicesService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/services';

  //Lista todos los servicios, incluidos los ocultos (uso administrativo).
  findAll(): Observable<Service[]> {
    return this.http.get<Service[]>(this.apiUrl);
  }

  //Lista solo los servicios visibles al público.
  findNotHidden(): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.apiUrl}/nothidden`);
  }

  //Busca un servicio por su id.
  findById(id: number): Observable<Service> {
    return this.http.get<Service>(`${this.apiUrl}/${id}`);
  }

  //Crea un servicio. Se quita el `id` del cuerpo porque lo genera el backend.
  add(service: Service | Omit<Service, 'id'>): Observable<Service> {
    const { id, ...payload } = service as any;
    return this.http.post<Service>(this.apiUrl, payload);
  }

  //Reemplaza los datos de un servicio (PUT).
  update(id: number, service: Service): Observable<Service> {
    return this.http.put<Service>(`${this.apiUrl}/${id}`, service);
  }

  //Muestra u oculta un servicio invirtiendo su campo `hidden`.
  toggleVisibility(service: Service): Observable<Service> {
    return this.update(service.id, {
      ...service,
      hidden: !service.hidden,
    });
  }

  //Elimina un servicio; el backend puede rechazarlo si está asociado a una reserva.
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
