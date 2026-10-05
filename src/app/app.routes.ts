import { Routes } from '@angular/router';
import { RoomsCardsComponent } from './pages/rooms-cards/rooms-cards.component';
import { LandingPageComponent } from './pages/landing-page/landing-page.component';
import { RoomsTypeDetailComponent } from './pages/rooms-type-detail/rooms-type-detail.component';
import { RoomTypesAdminComponent } from './pages/room-types-admin/room-types-admin.component';
import { RoomTypeFormComponent } from './pages/room-type-form/room-type-form.component';

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
    path: 'admin/rooms-types',
    component: RoomTypesAdminComponent,
  },
  {
    path: 'admin/room-types/edit/:id',
    component: RoomTypeFormComponent,
  },
  {
    path: 'admin/room-types/add',
    component: RoomTypeFormComponent,
  },
  {
    path: 'admin/services',
    loadComponent: () => import('./pages/services-admin/services-admin.component').then(m => m.ServicesAdminComponent)
  },
  {
    path: 'admin/services/edit/:id',
    loadComponent: () => import('./pages/service-form/service-form.component').then(m => m.ServiceFormComponent)
  },
  {
    path: 'admin/services/add',
    loadComponent: () => import('./pages/service-form/service-form.component').then(m => m.ServiceFormComponent)
  },
  {
    path: 'services',
    loadComponent: () => import('./pages/services-page/services-page.component').then(m => m.ServicesPageComponent)
  },
  {
    path: 'services/:id',
    loadComponent: () => import('./pages/service-detail/service-detail.component').then(m => m.ServiceDetailComponent)
  }
];
