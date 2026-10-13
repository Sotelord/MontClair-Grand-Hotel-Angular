import { Routes } from '@angular/router';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { RoomsCardsComponent } from './pages/rooms-cards/rooms-cards.component';
import { RoomsTypeDetailComponent } from './pages/rooms-type-detail/rooms-type-detail.component';
import { RoomDetailComponent } from './pages/room-detail/room-detail.component';
import { RoomTypesAdminComponent } from './pages/room-types-admin/room-types-admin.component';
import { RoomTypeFormComponent } from './pages/room-type-form/room-type-form.component';
import { RoomsAdminComponent } from './pages/rooms-admin/rooms-admin.component';
import { RoomFormComponent } from './pages/room-form/room-form.component';
import { ClientsAdminComponent } from './pages/clients-admin/clients-admin.component';
import { ClientFormComponent } from './pages/client-form/client-form.component';
import { ClientProfileComponent } from './pages/client-profile/client-profile.component';
import { ProfileEditComponent } from './pages/profile-edit/profile-edit.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { ReservationsAdminComponent } from './pages/reservations-admin/reservations-admin.component';
import { AdminReservationFormComponent } from './pages/admin-reservation-form/admin-reservation-form.component';
import { ClientReservationComponent } from './pages/client-reservation/client-reservation.component';
import { GalleryComponent } from './pages/gallery/gallery.component';
import { LocationComponent } from './pages/location/location.component';
import { ErrorPageComponent } from './pages/error-page/error-page.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingPageComponent,
  },
  {
    path: 'rooms/cards',
    component: RoomsCardsComponent,
  },
  {
    path: 'rooms/type/:id',
    component: RoomsTypeDetailComponent,
  },
  {
    path: 'rooms/:id',
    component: RoomDetailComponent,
  },
  {
    path: 'login',
    component: LoginPageComponent,
  },
  {
    path: 'profile',
    component: ClientProfileComponent,
  },
  {
    path: 'profile/edit',
    component: ProfileEditComponent,
  },
  {
    path: 'profile/:id',
    component: ClientProfileComponent,
  },
  {
    path: 'clients',
    component: ClientsAdminComponent,
  },
  {
    path: 'clients/add',
    component: ClientFormComponent,
  },
  {
    path: 'clients/edit/:id',
    component: ClientFormComponent,
  },
  {
    path: 'admin/rooms',
    component: RoomsAdminComponent,
  },
  {
    path: 'admin/rooms/add',
    component: RoomFormComponent,
  },
  {
    path: 'admin/rooms/edit/:id',
    component: RoomFormComponent,
  },
  {
    path: 'admin/rooms-types',
    component: RoomTypesAdminComponent,
  },
  {
    path: 'admin/room-types',
    redirectTo: 'admin/rooms-types',
    pathMatch: 'full',
  },
  {
    path: 'admin/room-types/add',
    component: RoomTypeFormComponent,
  },
  {
    path: 'admin/room-types/edit/:id',
    component: RoomTypeFormComponent,
  },
  {
    path: 'admin/clients',
    component: ClientsAdminComponent,
  },
  {
    path: 'admin/clients/add',
    component: ClientFormComponent,
  },
  {
    path: 'admin/clients/edit/:id',
    component: ClientFormComponent,
  },
  {
    path: 'admin/reservations',
    component: ReservationsAdminComponent,
  },
  {
    path: 'admin/reservations/new',
    component: AdminReservationFormComponent,
  },
  {
    path: 'admin/reservations/edit/:id',
    component: AdminReservationFormComponent,
  },
  {
    path: 'services',
    loadComponent: () =>
      import('./pages/services-page/services-page.component').then(
        (m) => m.ServicesPageComponent,
      ),
  },
  {
    path: 'services/:id',
    loadComponent: () =>
      import('./pages/service-detail/service-detail.component').then(
        (m) => m.ServiceDetailComponent,
      ),
  },
  {
    path: 'admin/services',
    loadComponent: () =>
      import('./pages/services-admin/services-admin.component').then(
        (m) => m.ServicesAdminComponent,
      ),
  },
  {
    path: 'admin/services/add',
    loadComponent: () =>
      import('./pages/service-form/service-form.component').then(
        (m) => m.ServiceFormComponent,
      ),
  },
  {
    path: 'admin/services/edit/:id',
    loadComponent: () =>
      import('./pages/service-form/service-form.component').then(
        (m) => m.ServiceFormComponent,
      ),
  },
  {
    path: 'reservations/book',
    component: ClientReservationComponent,
  },
  {
    path: 'reservations/book/:roomId',
    component: ClientReservationComponent,
  },
  {
    path: 'book',
    redirectTo: 'reservations/book',
    pathMatch: 'full',
  },
  {
    path: 'book/:roomId',
    redirectTo: 'reservations/book/:roomId',
    pathMatch: 'full',
  },
  {
    path: 'gallery',
    component: GalleryComponent,
  },
  {
    path: 'location',
    component: LocationComponent,
  },
  {
    path: 'error',
    component: ErrorPageComponent,
  },
  {
    path: '**',
    component: ErrorPageComponent,
  },
];
