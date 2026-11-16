import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, switchMap, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { ReservationDTO } from '../models/reservation.model';

export interface BoldCheckoutConfig {
  reservationId: number;
  orderId: string;
  apiKey: string;
  amount: string;
  currency: string;
  integritySignature: string;
  description: string;
  redirectionUrl: string;
  customerEmail?: string;
  customerFullName?: string;
  customerPhone?: string;
}

declare global {
  interface Window {
    BoldCheckout?: new (config: Record<string, unknown>) => { open: () => void };
  }
}

/**
 * Servicio que integra la librería oficial BoldCheckout (https://checkout.bold.co/library/boldPaymentButton.js)
 * con los endpoints de firma SHA-256 en el backend (/api/payments/bold).
 */
@Injectable({
  providedIn: 'root',
})
export class BoldPaymentService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/payments/bold`;
  private scriptLoadedPromise: Promise<void> | null = null;

  /**
   * Solicita al backend la sesión firmada (con valor fijo de 1) y abre el modal de BoldCheckout.
   */
  openCheckout(reservationId: number, returnPath: string): Observable<BoldCheckoutConfig> {
    return from(this.loadBoldScript()).pipe(
      switchMap(() =>
        this.http.post<BoldCheckoutConfig>(
          `${this.apiUrl}/checkout/${reservationId}`,
          { returnPath },
        ),
      ),
      tap((config) => {
        if (!window.BoldCheckout) {
          throw new Error('No se pudo inicializar la librería BoldCheckout en el navegador.');
        }

        const checkoutConfig: Record<string, unknown> = {
          orderId: config.orderId,
          currency: config.currency,
          amount: config.amount,
          apiKey: config.apiKey,
          integritySignature: config.integritySignature,
          description: config.description,
          redirectionUrl: config.redirectionUrl,
        };

        if (config.customerEmail || config.customerFullName) {
          checkoutConfig['customerData'] = JSON.stringify({
            email: config.customerEmail || '',
            fullName: config.customerFullName || '',
            phone: config.customerPhone || '',
          });
        }

        const checkout = new window.BoldCheckout(checkoutConfig);
        checkout.open();
      }),
    );
  }

  /**
   * Confirma en el backend una transacción aprobada tras el retorno de Bold.
   */
  confirmPayment(
    reservationId: number,
    orderId: string,
    txStatus: string,
  ): Observable<ReservationDTO> {
    return this.http.post<ReservationDTO>(`${this.apiUrl}/confirm`, {
      reservationId,
      orderId,
      txStatus,
    });
  }

  /**
   * Extrae el ID de la reserva a partir de un orderId con formato "MC-RES-{id}-{timestamp}".
   */
  extractReservationId(orderId: string | null): number | null {
    if (!orderId || !orderId.startsWith('MC-RES-')) {
      return null;
    }
    const parts = orderId.split('-');
    if (parts.length < 3) {
      return null;
    }
    const id = Number(parts[2]);
    return isNaN(id) || id <= 0 ? null : id;
  }

  private loadBoldScript(): Promise<void> {
    if (typeof window !== 'undefined' && window.BoldCheckout) {
      return Promise.resolve();
    }
    if (this.scriptLoadedPromise) {
      return this.scriptLoadedPromise;
    }

    this.scriptLoadedPromise = new Promise<void>((resolve, reject) => {
      const existingScript = document.querySelector(
        'script[src="https://checkout.bold.co/library/boldPaymentButton.js"]',
      ) as HTMLScriptElement | null;

      if (existingScript) {
        if (window.BoldCheckout) {
          resolve();
          return;
        }
        existingScript.addEventListener('load', () => resolve());
        existingScript.addEventListener('error', () =>
          reject(new Error('No se pudo cargar el script de Bold.')),
        );
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.bold.co/library/boldPaymentButton.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        this.scriptLoadedPromise = null;
        reject(new Error('No se pudo cargar la pasarela de Bold. Verifique su conexión.'));
      };
      document.head.appendChild(script);
    });

    return this.scriptLoadedPromise;
  }
}

