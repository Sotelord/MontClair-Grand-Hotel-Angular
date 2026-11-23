import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { RewardDTO, RewardRequestDTO } from '../models/loyalty.model';

/**
 * Servicio REST del catálogo de recompensas (/api/rewards).
 */
@Injectable({
  providedIn: 'root',
})
export class RewardService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/rewards`;

  getActiveCatalog(category?: string): Observable<RewardDTO[]> {
    let params = new HttpParams();
    if (category && category !== 'ALL') {
      params = params.set('category', category);
    }
    return this.http.get<RewardDTO[]>(this.apiUrl, { params });
  }

  getAllRewardsAdmin(): Observable<RewardDTO[]> {
    return this.http.get<RewardDTO[]>(`${this.apiUrl}/admin`);
  }

  findById(id: number): Observable<RewardDTO> {
    return this.http.get<RewardDTO>(`${this.apiUrl}/${id}`);
  }

  createReward(request: RewardRequestDTO): Observable<RewardDTO> {
    return this.http.post<RewardDTO>(this.apiUrl, request);
  }

  updateReward(id: number, request: RewardRequestDTO): Observable<RewardDTO> {
    return this.http.put<RewardDTO>(`${this.apiUrl}/${id}`, request);
  }

  deactivateReward(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
