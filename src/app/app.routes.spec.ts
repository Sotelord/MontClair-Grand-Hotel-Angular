import { routes } from './app.routes';
import { clientGuard } from './guards/client.guard';
import { TouristGuideComponent } from './pages/tourist-guide/tourist-guide.component';
import { ClientProfileComponent } from './pages/client-profile/client-profile.component';

describe('tourism routes', () => {
  it('keeps Descubre Mónaco public', () => {
    const route = routes.find((candidate) => candidate.path === 'discover-monaco');

    expect(route?.component).toBe(TouristGuideComponent);
    expect(route?.canActivate).toBeUndefined();
  });

  it('keeps the existing profile protected by the client guard', () => {
    const route = routes.find((candidate) => candidate.path === 'profile');

    expect(route?.component).toBe(ClientProfileComponent);
    expect(route?.canActivate).toContain(clientGuard);
  });
});
