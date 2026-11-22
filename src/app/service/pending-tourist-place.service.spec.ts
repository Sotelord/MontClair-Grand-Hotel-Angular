import { TestBed } from '@angular/core/testing';
import { PendingTouristPlaceService } from './pending-tourist-place.service';

describe('PendingTouristPlaceService', () => {
  let service: PendingTouristPlaceService;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(PendingTouristPlaceService);
  });

  it('persists a selected place until it is consumed after authentication', () => {
    service.save(42);

    expect(service.hasPending()).toBeTrue();
    expect(service.getPending()).toBe(42);
    expect(service.hasPending()).toBeTrue();
    service.clearPending();
    expect(service.hasPending()).toBeFalse();
    expect(service.getPending()).toBeNull();
  });

  it('rejects invalid stored place identifiers', () => {
    sessionStorage.setItem('montclair_pending_tourist_place', '0');

    expect(service.getPending()).toBeNull();
    expect(service.hasPending()).toBeFalse();
  });
});
