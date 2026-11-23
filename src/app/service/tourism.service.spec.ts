import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TourismService } from './tourism.service';

describe('TourismService', () => {
  let service: TourismService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        TourismService,
      ],
    });
    service = TestBed.inject(TourismService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loads the public tourist catalog and supports category filters', () => {
    service.getPlaces('CULTURA').subscribe((places) => {
      expect(places).toEqual([]);
    });

    const request = httpMock.expectOne(
      'http://localhost:8080/api/tourist-places?category=CULTURA',
    );
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('uses the existing private itinerary endpoints and optimization payload', () => {
    service.addToMyItinerary(14).subscribe();
    const addRequest = httpMock.expectOne(
      'http://localhost:8080/api/tourism/itinerary/14',
    );
    expect(addRequest.request.method).toBe('POST');
    addRequest.flush({});

    service.optimizeMyItinerary('WALKING', true).subscribe();
    const optimizeRequest = httpMock.expectOne(
      'http://localhost:8080/api/tourism/itinerary/optimize',
    );
    expect(optimizeRequest.request.body).toEqual({
      mode: 'WALKING',
      returnToHotel: true,
    });
    optimizeRequest.flush({});
  });
});
