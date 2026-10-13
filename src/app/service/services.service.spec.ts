import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { ServicesService } from './services.service';

describe('ServicesService', () => {
  let service: ServicesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ServicesService],
    });

    service = TestBed.inject(ServicesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should emit the updated list after the service is edited', () => {
    const initialService = {
      id: 1,
      name: 'Spa',
      description: 'Relax',
      price: 120,
      imageUrl: 'spa.jpg',
      tag: 'Wellness',
      schedule: '10:00-18:00',
      icon: '',
      highlights: [],
      galleryImages: [],
      hidden: false,
    };

    const updatedService = {
      ...initialService,
      name: 'Spa Premium',
    };

    service.services$.subscribe();

    const initialRequest = httpMock.expectOne('http://localhost:8080/api/services');
    initialRequest.flush([initialService]);

    const emissions: any[] = [];
    service.services$.subscribe((items) => emissions.push(items));

    service.update(1, updatedService).subscribe();

    const updateRequest = httpMock.expectOne(
      'http://localhost:8080/api/services/1',
    );
    updateRequest.flush(updatedService);

    expect(emissions.length).toBeGreaterThan(0);
    expect(emissions.at(-1)?.[0].name).toBe('Spa Premium');
  });
});
