import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('logs in and synchronizes the authenticated client', () => {
    const client = {
      id: 7,
      username: 'demo',
      email: 'demo@example.com',
      firstName: 'Demo',
      role: 'CLIENT',
    };

    service.login('demo', 'demo').subscribe((result) => {
      expect(result.success).toBeTrue();
      expect(service.currentUser?.id).toBe(7);
    });

    const request = httpMock.expectOne('http://localhost:8080/api/auth/login');
    expect(request.request.body).toEqual({ identifier: 'demo', password: 'demo' });
    request.flush({ success: true, client });
  });

  it('restores and clears the session through /me', () => {
    const client = {
      id: 3,
      username: 'operator',
      email: 'operator@example.com',
      firstName: 'Operator',
      role: 'OPERATOR',
    };

    service.restoreSession().subscribe((restored) => expect(restored?.id).toBe(3));
    httpMock.expectOne('http://localhost:8080/api/auth/me').flush(client);

    service.reloadSession().subscribe((restored) => expect(restored).toBeNull());
    httpMock.expectOne('http://localhost:8080/api/auth/me').flush(
      { message: 'Unauthorized' },
      { status: 401, statusText: 'Unauthorized' },
    );
  });

  it('logs out and clears local state', () => {
    service.clearCurrentUser();
    service.logout().subscribe();
    const request = httpMock.expectOne('http://localhost:8080/api/auth/logout');
    request.flush({});
    expect(service.currentUser).toBeNull();
  });
});
