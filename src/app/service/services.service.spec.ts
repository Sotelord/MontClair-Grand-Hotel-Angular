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

    service.findAll().subscribe((items) => {
      expect(items.length).toBe(1);
    });

    const initialRequest = httpMock.expectOne('http://localhost:8080/api/services');
    initialRequest.flush([initialService]);

    service.update(1, updatedService).subscribe((updated) => {
      expect(updated.name).toBe('Spa Premium');
    });

    const updateRequest = httpMock.expectOne(
      'http://localhost:8080/api/services/1',
    );
    updateRequest.flush(updatedService);
  });
});
