import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { montclairAuthInterceptor } from './montclair-auth.interceptor';

describe('montclairAuthInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([montclairAuthInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('adds credentials to backend requests but not external requests', () => {
    http.get('http://localhost:8080/api/rooms').subscribe();
    const backend = httpMock.expectOne('http://localhost:8080/api/rooms');
    expect(backend.request.withCredentials).toBeTrue();
    backend.flush([]);

    http.get('https://example.com/data').subscribe();
    const external = httpMock.expectOne('https://example.com/data');
    expect(external.request.withCredentials).toBeFalse();
    external.flush({});
  });

  it('fetches CSRF and adds it to mutating requests', fakeAsync(() => {
    http.post('http://localhost:8080/api/reservations', { roomId: 1 }).subscribe();
    const csrf = httpMock.expectOne('http://localhost:8080/api/auth/csrf');
    expect(csrf.request.withCredentials).toBeTrue();
    csrf.flush({ token: 'csrf-test-token' });
    tick();

    const mutation = httpMock.expectOne('http://localhost:8080/api/reservations');
    expect(mutation.request.headers.get('X-XSRF-TOKEN')).toBe('csrf-test-token');
    expect(mutation.request.withCredentials).toBeTrue();
    mutation.flush({});
  }));
});
