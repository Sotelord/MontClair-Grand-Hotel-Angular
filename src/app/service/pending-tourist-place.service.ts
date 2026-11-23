import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PendingTouristPlaceService {
  private readonly storageKey = 'montclair_pending_tourist_place';

  save(placeId: number): void {
    sessionStorage.setItem(this.storageKey, String(placeId));
  }

  hasPending(): boolean {
    return sessionStorage.getItem(this.storageKey) !== null;
  }

  getPending(): number | null {
    const value = sessionStorage.getItem(this.storageKey);
    if (!value || !/^\d+$/.test(value)) {
      sessionStorage.removeItem(this.storageKey);
      return null;
    }

    const placeId = Number(value);
    if (!Number.isSafeInteger(placeId) || placeId <= 0) {
      sessionStorage.removeItem(this.storageKey);
      return null;
    }
    return placeId;
  }

  clearPending(): void {
    sessionStorage.removeItem(this.storageKey);
  }
}
