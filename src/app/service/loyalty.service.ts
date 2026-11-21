import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  LoyaltySummaryDTO,
  PointAdjustmentRequestDTO,
  PointTransactionDTO,
  PointTransactionType,
  RedeemedRewardDTO,
} from '../models/loyalty.model';

/**
 * Servicio REST del programa de fidelidad (/api/loyalty).
 * Gestiona resumen de puntos/categoría, historial de transacciones, canjeos y ajustes.
 */
@Injectable({
  providedIn: 'root',
})
export class LoyaltyService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/loyalty`;

  getMySummary(): Observable<LoyaltySummaryDTO> {
    return this.http.get<LoyaltySummaryDTO>(`${this.apiUrl}/me`);
  }

  getClientSummary(clientId: number): Observable<LoyaltySummaryDTO> {
    return this.http.get<LoyaltySummaryDTO>(
      `${this.apiUrl}/clients/${clientId}`,
    );
  }

  getMyTransactions(
    type?: PointTransactionType,
  ): Observable<PointTransactionDTO[]> {
    let params = new HttpParams();
    if (type) {
      params = params.set('type', type);
    }
    return this.http.get<PointTransactionDTO[]>(
      `${this.apiUrl}/me/transactions`,
      { params },
    );
  }

  getClientTransactions(
    clientId: number,
    type?: PointTransactionType,
  ): Observable<PointTransactionDTO[]> {
    let params = new HttpParams();
    if (type) {
      params = params.set('type', type);
    }
    return this.http.get<PointTransactionDTO[]>(
      `${this.apiUrl}/clients/${clientId}/transactions`,
      { params },
    );
  }

  getMyRedeemedRewards(): Observable<RedeemedRewardDTO[]> {
    return this.http.get<RedeemedRewardDTO[]>(`${this.apiUrl}/me/redeemed`);
  }

  getClientRedeemedRewards(clientId: number): Observable<RedeemedRewardDTO[]> {
    return this.http.get<RedeemedRewardDTO[]>(
      `${this.apiUrl}/clients/${clientId}/redeemed`,
    );
  }

  redeemReward(rewardId: number): Observable<RedeemedRewardDTO> {
    return this.http.post<RedeemedRewardDTO>(
      `${this.apiUrl}/me/redeem/${rewardId}`,
      {},
    );
  }

  adjustClientPoints(
    clientId: number,
    request: PointAdjustmentRequestDTO,
  ): Observable<PointTransactionDTO> {
    return this.http.post<PointTransactionDTO>(
      `${this.apiUrl}/clients/${clientId}/adjust`,
      request,
    );
  }

  getAllRedeemedRewards(): Observable<RedeemedRewardDTO[]> {
    return this.http.get<RedeemedRewardDTO[]>(`${this.apiUrl}/redeemed`);
  }

  markRedemptionAsUsed(redemptionId: number): Observable<RedeemedRewardDTO> {
    return this.http.patch<RedeemedRewardDTO>(
      `${this.apiUrl}/redeemed/${redemptionId}/use`,
      {},
    );
  }
}
